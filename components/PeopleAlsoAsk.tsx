"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";

interface TreeNode {
    name: string;
    children?: TreeNode[];
}

export default function PeopleAlsoAsk({
    data,
    keyword,
}: {
    data: TreeNode;
    keyword: string;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [zoom, setZoom] = useState(75);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

    const renderTree = useCallback(() => {
        if (!data || !svgRef.current || !containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = Math.max(600, (data.children?.length || 1) * 120);

        d3.select(svgRef.current).selectAll("*").remove();

        const svg = d3
            .select(svgRef.current)
            .attr("width", width)
            .attr("height", height);

        const g = svg.append("g").attr("transform", `translate(80, ${height / 2})`);

        // Zoom behavior
        const zoomBehavior = d3
            .zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.3, 2])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
                setZoom(Math.round(event.transform.k * 100));
            });

        svg.call(zoomBehavior);
        zoomBehaviorRef.current = zoomBehavior;

        // Set initial zoom
        const initialScale = zoom / 100;
        svg.call(
            zoomBehavior.transform,
            d3.zoomIdentity.translate(80, height / 2).scale(initialScale)
        );

        // Tree layout — HORIZONTAL
        const treeLayout = d3
            .tree<TreeNode>()
            .size([height - 100, width - 300])
            .separation((a, b) => (a.parent === b.parent ? 1 : 1.5));

        const root = d3.hierarchy(data);
        const treeData = treeLayout(root);

        // Draw curved links
        const linkGenerator = d3
            .linkHorizontal<d3.HierarchyPointLink<TreeNode>, d3.HierarchyPointNode<TreeNode>>()
            .x((d: any) => d.y)
            .y((d: any) => d.x);

        g.selectAll(".link")
            .data(treeData.links())
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("d", linkGenerator as any)
            .style("fill", "none")
            .style("stroke", "#ff8c00")
            .style("stroke-opacity", 0.5)
            .style("stroke-width", 2);

        // Draw nodes
        const node = g
            .selectAll(".node")
            .data(treeData.descendants())
            .enter()
            .append("g")
            .attr("transform", (d: any) => `translate(${d.y},${d.x})`);

        // Root node — larger circle
        node
            .filter((d) => d.depth === 0)
            .append("circle")
            .attr("r", 8)
            .style("fill", "#ff6b35")
            .style("stroke", "#fff")
            .style("stroke-width", 2);

        // Branch nodes — medium circle
        node
            .filter((d) => d.depth > 0 && d.children !== undefined)
            .append("circle")
            .attr("r", 5)
            .style("fill", "#ff8c00")
            .style("stroke", "#fff")
            .style("stroke-width", 1.5);

        // Leaf nodes — small plus icon
        const leafNodes = node.filter((d) => d.depth > 0 && d.children === undefined);

        leafNodes
            .append("circle")
            .attr("r", 8)
            .style("fill", "#fff")
            .style("stroke", "#ff8c00")
            .style("stroke-width", 1.5)
            .style("cursor", "pointer");

        leafNodes
            .append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("fill", "#ff8c00")
            .style("pointer-events", "none")
            .text("+");

        // Labels
        node
            .append("text")
            .attr("dy", "0.31em")
            .attr("x", (d: any) => (d.children ? -12 : 16))
            .attr("text-anchor", (d: any) => (d.children ? "end" : "start"))
            .text((d: any) => d.data.name)
            .style("font-size", (d: any) => (d.depth === 0 ? "14px" : "11px"))
            .style("font-weight", (d: any) => (d.depth === 0 ? "700" : "400"))
            .style("fill", "#374151")
            .style("font-family", "Inter, sans-serif")
            .clone(true)
            .lower()
            .style("stroke", "white")
            .style("stroke-width", 4)
            .style("stroke-linejoin", "round");
    }, [data, zoom]);

    useEffect(() => {
        renderTree();
    }, [renderTree]);

    const handleZoom = (direction: "in" | "out") => {
        if (!svgRef.current || !zoomBehaviorRef.current) return;
        const svg = d3.select(svgRef.current);
        if (direction === "in") {
            svg.transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.2);
        } else {
            svg.transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.8);
        }
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!isFullscreen) {
            containerRef.current.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
        setIsFullscreen(!isFullscreen);
    };

    return (
        <div ref={containerRef} className="tree-container">
            {/* Header */}
            <div className="results-section-header">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-gray-900">People Also Ask from</h2>
                    <span className="text-sm text-gray-400">
                        <svg className="w-5 h-5 inline" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={toggleFullscreen} className="btn-export">
                        {isFullscreen ? "✕ Exit Fullscreen" : "⛶ Fullscreen"}
                    </button>
                    <button className="btn-export">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export
                    </button>
                </div>
            </div>

            {/* Zoom controls */}
            <div className="tree-controls">
                <span className="text-xs text-gray-500 mr-1">Zoom: {zoom}%</span>
                <button onClick={() => handleZoom("out")} className="tree-zoom-btn">
                    −
                </button>
                <button onClick={() => handleZoom("in")} className="tree-zoom-btn">
                    +
                </button>
            </div>

            {/* SVG */}
            <div className="p-4 overflow-hidden" style={{ minHeight: 500 }}>
                <svg ref={svgRef} className="w-full" />
            </div>
        </div>
    );
}
