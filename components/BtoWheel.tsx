"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface TreeNode {
  name: string;
  children?: TreeNode[];
}

export default function BtoWheel({ data }: { data: TreeNode }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 900;
    const height = 600;
    const margin = { top: 40, right: 200, bottom: 40, left: 100 };

    const root = d3.hierarchy(data);
    const treeLayout = d3.tree<TreeNode>().size([
      height - margin.top - margin.bottom,
      width - margin.left - margin.right
    ]);
    treeLayout(root as d3.HierarchyNode<TreeNode>);

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("font-family", "Arial, sans-serif");

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Color scale for different branches
    const colorScale = d3.scaleOrdinal<string>()
      .domain(["Questions", "Eligibility", "Financials"])
      .range(["#ef4444", "#22c55e", "#3b82f6"]);

    // Draw Links with curved paths
    g.selectAll(".link")
      .data(root.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal<d3.HierarchyLink<TreeNode>, d3.HierarchyPointNode<TreeNode>>()
        .x(d => d.y)
        .y(d => d.x) as unknown as string)
      .attr("fill", "none")
      .attr("stroke", d => {
        // Get the branch color based on the source node
        const sourceData = d.source.data as TreeNode;
        if (sourceData.name === data.name) {
          const targetData = d.target.data as TreeNode;
          return colorScale(targetData.name);
        }
        // Find the branch this link belongs to
        let current = d.source;
        while (current.parent && current.parent.data.name !== data.name) {
          current = current.parent as d3.HierarchyPointNode<TreeNode>;
        }
        return colorScale(current.data.name);
      })
      .attr("stroke-width", d => d.source.depth === 0 ? 3 : 2)
      .attr("stroke-opacity", 0.6);

    // Draw Nodes
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.y},${d.x})`);

    // Node circles
    node.append("circle")
      .attr("r", d => d.depth === 0 ? 12 : d.depth === 1 ? 8 : 5)
      .attr("fill", d => {
        if (d.depth === 0) return "#1f2937";
        if (d.depth === 1) return colorScale(d.data.name);
        // For leaf nodes, find their branch
        let current = d;
        while (current.parent && current.depth > 1) {
          current = current.parent as d3.HierarchyPointNode<TreeNode>;
        }
        return colorScale(current.data.name);
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // Node labels
    node.append("text")
      .text(d => d.data.name)
      .attr("x", d => d.children ? -12 : 12)
      .attr("dy", ".35em")
      .attr("text-anchor", d => d.children ? "end" : "start")
      .style("font-size", d => d.depth === 0 ? "16px" : d.depth === 1 ? "14px" : "12px")
      .style("font-weight", d => d.depth <= 1 ? "bold" : "normal")
      .style("fill", "#374151");

  }, [data]);

  return (
    <div className="overflow-x-auto w-full">
      <svg ref={svgRef} className="mx-auto"></svg>
    </div>
  );
}
