import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface Step {
  id: number;
  title: string;
}

interface TimelineChartProps {
  steps: Step[];
  completedSteps: number[];
}

export default function TimelineChart({ steps, completedSteps }: TimelineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current) return;
    
    const renderChart = () => {
      const containerWidth = wrapperRef.current?.clientWidth || 800;
      // Guarantee a minimum width to prevent squishing
      const width = Math.max(containerWidth, 600);
      const height = 180;
      const margin = { top: 60, right: 60, bottom: 60, left: 60 };
      const innerWidth = width - margin.left - margin.right;
      
      // Clear previous drawing
      d3.select(svgRef.current).selectAll("*").remove();
      
      const svg = d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height);
        
      const g = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
        
      const nodeSpacing = innerWidth / (steps.length - 1 || 1);
      
      let maxCompletedId = 0;
      if (completedSteps.length > 0) {
        maxCompletedId = Math.max(...completedSteps);
      }

      const nodes = steps.map((step, i) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = step.id === maxCompletedId + 1;
        
        return {
          ...step,
          x: innerWidth - (i * nodeSpacing), // RTL Layout: right to left
          y: (height - margin.top - margin.bottom) / 2,
          isCompleted,
          isCurrent
        };
      });

      // 1. Draw Background Line
      g.append("line")
        .attr("x1", 0)
        .attr("y1", nodes[0].y)
        .attr("x2", innerWidth)
        .attr("y2", nodes[0].y)
        .attr("stroke", "#e2e8f0")
        .attr("stroke-width", 4)
        .attr("stroke-linecap", "round");
        
      // 2. Draw Progress Line
      if (completedSteps.length > 0) {
        const completedNodes = nodes.filter(n => n.isCompleted);
        const progressToX = Math.min(...completedNodes.map(n => n.x));
        
        g.append("line")
          .attr("x1", innerWidth)
          .attr("y1", nodes[0].y)
          .attr("x2", progressToX)
          .attr("y2", nodes[0].y)
          .attr("stroke", "#10b981")
          .attr("stroke-width", 4)
          .attr("stroke-linecap", "round");
      }

      // 3. Create Node Groups
      const nodeGroups = g.selectAll(".node")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x}, ${d.y})`);

      // 4. Draw Current Node Ripple Effect
      nodeGroups.filter(d => d.isCurrent)
        .append("circle")
        .attr("r", 20)
        .attr("fill", "none")
        .attr("stroke", "#6366f1")
        .attr("stroke-width", 2)
        .attr("opacity", 0.4)
        .style("animation", "pulse 2s infinite");

      // 5. Draw Node Circles
      nodeGroups.append("circle")
        .attr("r", d => d.isCurrent ? 14 : 10)
        .attr("fill", d => d.isCompleted ? "#10b981" : d.isCurrent ? "#ffffff" : "#f1f5f9")
        .attr("stroke", d => d.isCompleted ? "#10b981" : d.isCurrent ? "#6366f1" : "#cbd5e1")
        .attr("stroke-width", d => d.isCurrent ? 4 : 2)
        .style("filter", d => d.isCurrent ? "drop-shadow(0 4px 6px rgba(99, 102, 241, 0.3))" : "none");

      // 6. Draw Checkmarks for Completed
      nodeGroups.filter(d => d.isCompleted)
        .append("path")
        .attr("d", "M -3 -1 L -1 2 L 4 -3")
        .attr("fill", "none")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 2.5)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round");

      // 7. Draw Labels
      nodeGroups.append("text")
        .attr("text-anchor", "middle")
        .text(d => d.title)
        .attr("fill", d => d.isCompleted ? "#064e3b" : d.isCurrent ? "#4338ca" : "#64748b")
        .attr("font-size", d => d.isCurrent ? "14px" : "12px")
        .attr("font-weight", d => d.isCurrent || d.isCompleted ? "bold" : "normal")
        .attr("dy", (d, i) => i % 2 === 0 ? -24 : 40) // Staggered to prevent overlap
        .style("pointer-events", "none")
        .style("font-family", "'Tajawal', sans-serif");
    };

    renderChart();
    
    // Add resize listener for responsive redraw
    window.addEventListener("resize", renderChart);
    return () => window.removeEventListener("resize", renderChart);
  }, [steps, completedSteps]);

  return (
    <div className="w-full">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 0; }
          100% { transform: scale(0.95); opacity: 0; }
        }
      `}} />
      <div 
        ref={wrapperRef} 
        className="w-full overflow-x-auto overflow-y-hidden hide-scrollbar bg-white rounded-2xl border border-slate-200 shadow-sm p-2"
        dir="rtl"
      >
        <svg ref={svgRef} className="block mx-auto min-w-[600px]"></svg>
      </div>
    </div>
  );
}
