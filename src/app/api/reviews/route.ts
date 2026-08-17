import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate User (Must be logged in to leave review)
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'You must be signed in to submit a review.' }, { status: 401 });
    }

    const body = await req.json();
    const { productId, rating, title, comment } = body;

    // 2. Validate Inputs
    if (!productId || typeof productId !== 'string') {
      return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
    }

    const numRating = parseInt(String(rating), 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json({ error: 'Rating must be an integer between 1 and 5 stars.' }, { status: 400 });
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Review title is required.' }, { status: 400 });
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length < 5) {
      return NextResponse.json({ error: 'Review comment must be at least 5 characters long.' }, { status: 400 });
    }

    // 3. Verify Product Exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    // 4. One Review Per User Per Product (Check Existing Review)
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId: user.id,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already submitted a review for this component.' },
        { status: 400 }
      );
    }

    // 5. Create Review in Database
    const review = await prisma.review.create({
      data: {
        productId,
        userId: user.id,
        rating: numRating,
        title: title.trim(),
        comment: comment.trim(),
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        author: review.user.name,
        createdAt: review.createdAt,
      },
      message: 'Review submitted successfully.',
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'productId parameter is required' }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    return NextResponse.json({
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        author: r.user.name,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
