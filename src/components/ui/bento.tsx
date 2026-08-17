"use client";

import { clsx } from "clsx";
import { motion } from "framer-motion";
import { Cpu, ShieldCheck, Zap, Globe, Activity, Radio } from "lucide-react";

export default function FUIBentoGridDark() {
  return (
    <section className="py-20 max-w-[1400px] mx-auto px-4 relative z-10">
      <div className="flex flex-col mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono tracking-widest uppercase text-primary bg-primary/10 rounded-full mb-4 border border-primary/20 backdrop-blur-md w-fit shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          <Activity className="w-4 h-4 animate-pulse" />
          <span>Platform Capabilities</span>
        </div>
        <h2 className="font-heading tracking-tight text-3xl md:text-5xl font-extrabold text-foreground">
          Built for <span className="text-gradient">Hardware Engineers</span> & Innovators
        </h2>
        <p className="max-w-3xl text-lg md:text-xl font-medium tracking-tight mt-4 text-muted-foreground">
          Industrial-grade component sourcing, edge AI acceleration, and reliable nationwide fulfillment.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:mt-12 lg:grid-cols-6 lg:grid-rows-2">
        <BentoCard
          eyebrow="AI Edge Compute"
          title="Ultra-Low Latency Inference"
          description="Deploy TPU and NPU accelerator modules for real-time vision, sensor fusion, and autonomous robotics."
          graphic={
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background/80 to-background flex items-center justify-center p-8 overflow-hidden">
              <div className="relative w-full h-full border border-primary/30 rounded-2xl bg-card/60 backdrop-blur-md flex flex-col p-6 items-center justify-center text-center group-hover:scale-105 transition-transform duration-500">
                <Cpu className="w-20 h-20 text-primary animate-pulse mb-4" />
                <div className="font-mono text-xs text-primary font-bold tracking-widest uppercase bg-primary/10 px-3 py-1 rounded-full border border-primary/30">
                  8 TFLOPS • INT8 Tensor Core
                </div>
              </div>
            </div>
          }
          className="max-lg:rounded-t-3xl lg:col-span-3 lg:rounded-tl-3xl"
        />

        <BentoCard
          eyebrow="Precision Sensing"
          title="Calibrated Sensor Clusters"
          description="Industrial IMUs, LiDAR nodes, and environmental gas sensors pre-tested for aerospace and medical prototypes."
          graphic={
            <div className="absolute inset-0 bg-gradient-to-bl from-accent/20 via-background/80 to-background flex items-center justify-center p-8 overflow-hidden">
              <div className="relative w-full h-full border border-accent/30 rounded-2xl bg-card/60 backdrop-blur-md flex flex-col p-6 items-center justify-center text-center group-hover:scale-105 transition-transform duration-500">
                <Radio className="w-20 h-20 text-accent mb-4 animate-bounce" style={{ animationDuration: "4s" }} />
                <div className="font-mono text-xs text-accent font-bold tracking-widest uppercase bg-accent/10 px-3 py-1 rounded-full border border-accent/30">
                  Sub-Millimeter Accuracy
                </div>
              </div>
            </div>
          }
          className="lg:col-span-3 lg:rounded-tr-3xl"
        />

        <BentoCard
          eyebrow="Power Efficiency"
          title="Integrated PMIC Modules"
          description="High-density power regulators and battery management boards engineered for max longevity."
          graphic={
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-background/80 to-background flex items-center justify-center p-6 overflow-hidden">
              <div className="relative w-full h-full border border-primary/20 rounded-2xl bg-card/50 backdrop-blur-md flex flex-col p-4 items-center justify-center text-center">
                <Zap className="w-16 h-16 text-primary mb-2" />
                <div className="font-mono text-xs text-muted-foreground">98.4% Conversion Efficiency</div>
              </div>
            </div>
          }
          className="lg:col-span-2 lg:rounded-bl-3xl"
        />

        <BentoCard
          eyebrow="Verification"
          title="100% Genuine Guarantee"
          description="Direct manufacturer partnerships ensure zero counterfeit chips, full traceability, and datasheet compliance."
          graphic={
            <div className="absolute inset-0 bg-gradient-to-tl from-primary/10 via-background/80 to-background flex items-center justify-center p-6 overflow-hidden">
              <div className="relative w-full h-full border border-primary/20 rounded-2xl bg-card/50 backdrop-blur-md flex flex-col p-4 items-center justify-center text-center">
                <ShieldCheck className="w-16 h-16 text-primary mb-2" />
                <div className="font-mono text-xs text-muted-foreground">ISO 9001 Certified Quality</div>
              </div>
            </div>
          }
          className="lg:col-span-2"
        />

        <BentoCard
          eyebrow="Logistics"
          title="Express Nationwide Delivery"
          description="Same-day dispatch for verified orders across India with real-time package telemetry."
          graphic={
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-background/80 to-background flex items-center justify-center p-6 overflow-hidden">
              <div className="relative w-full h-full border border-accent/20 rounded-2xl bg-card/50 backdrop-blur-md flex flex-col p-4 items-center justify-center text-center">
                <Globe className="w-16 h-16 text-accent mb-2" />
                <div className="font-mono text-xs text-muted-foreground">24-Hour Dispatch Pipeline</div>
              </div>
            </div>
          }
          className="max-lg:rounded-b-3xl lg:col-span-2 lg:rounded-br-3xl"
        />
      </div>
    </section>
  );
}

export function BentoCard({
  dark = false,
  className = "",
  eyebrow,
  title,
  description,
  graphic,
  fade = [],
}: {
  dark?: boolean;
  className?: string;
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  graphic?: React.ReactNode;
  fade?: ("top" | "bottom")[];
}) {
  return (
    <motion.div
      initial="idle"
      whileHover="active"
      variants={{ idle: {}, active: {} }}
      data-dark={dark ? "true" : undefined}
      className={clsx(
        className,
        "group relative flex flex-col overflow-hidden rounded-3xl transition-all duration-300",
        "glass border border-border/80 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]"
      )}
    >
      <div className="relative h-[22rem] shrink-0 overflow-hidden">
        {graphic}
        {fade.includes("top") && (
          <div className="absolute inset-0 bg-gradient-to-b from-background to-transparent opacity-60 pointer-events-none" />
        )}
        {fade.includes("bottom") && (
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60 pointer-events-none" />
        )}
      </div>

      <div className="relative p-5 sm:p-8 z-20 isolate mt-[-40px] sm:mt-[-80px] min-h-[10rem] sm:min-h-[12rem] bg-card/85 backdrop-blur-2xl border-t border-border/50 text-foreground flex flex-col justify-end">
        <span className="tech-label">{eyebrow}</span>
        <h3 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
          {title}
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
