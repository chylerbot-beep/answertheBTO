"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function BtoWheel({ data }: { data: any }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const width = 800;
    const height = 800;
    const radius = width / 2;

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Create the Radial Tree Layout
    const tree = d3.tree<any>()
      .size([2 * Math.PI, radius - 150]) // 360 degrees, radius with padding
      .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth);

    const root = d3.hierarchy(data);
    const treeData = tree(root);

    // Draw Links (Curved lines)
    svg.selectAll(".link")
      .data(treeData.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("d", d3.linkRadial<any, any>()
        .angle((d: any) => d.x)
        .radius((d: any) => d.y) as any
      )
      .style("fill", "none")
      .style("stroke", "#ff8c00") // Orange color like AnswerThePublic
      .style("stroke-opacity", 0.4)
      .style("stroke-width", 1.5);

    // Draw Nodes (Circles)
    const node = svg.selectAll(".node")
      .data(treeData.descendants())
      .enter().append("g")
      .attr("transform", (d: any) => `
        rotate(${(d.x * 180) / Math.PI - 90})
        translate(${d.y},0)
      `);

    node.append("circle")
      .attr("r", 4)
      .style("fill", (d) => d.depth === 0 ? "#000" : "#ff8c00");

    // Draw Text
    node.append("text")
      .attr("dy", "0.31em")
      .attr("x", (d: any) => d.x < Math.PI === !d.children ? 6 : -6)
      .attr("text-anchor", (d: any) => d.x < Math.PI === !d.children ? "start" : "end")
      .attr("transform", (d: any) => d.x >= Math.PI ? "rotate(180)" : null)
      .text((d: any) => d.data.name)
      .style("font-size", "10px")
      .style("font-family", "sans-serif")
      .clone(true).lower()
      .style("stroke", "white")
      .style("stroke-width", 3);
      
  }, [data]);

  return <svg ref={svgRef} className="w-full h-auto max-w-2xl mx-auto border rounded-xl shadow-sm bg-orange-50/30"></svg>;
}
