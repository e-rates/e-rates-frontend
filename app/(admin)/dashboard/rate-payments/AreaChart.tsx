'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { PaymentVolumeData } from './data';

interface AreaChartProps {
  data: PaymentVolumeData[];
  timeframe: 'daily' | 'weekly' | 'monthly';
}

export const AreaChart: React.FC<AreaChartProps> = ({ data, timeframe }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Chart dimensions and margins
    const width = 928;
    const height = 500;
    const marginTop = 20;
    const marginRight = 30;
    const marginBottom = 50;
    const marginLeft = 60;

    // Create scales
    const x = d3.scaleUtc(
      d3.extent(data, d => d.date) as [Date, Date],
      [marginLeft, width - marginRight]
    );

    // Extend Y-axis range by 20% to prevent squeezing
    const maxVolume = d3.max(data, d => d.volume) as number;
    const y = d3.scaleLinear(
      [0, maxVolume * 1.2],
      [height - marginBottom, marginTop]
    );

    // Create area generator - NO SMOOTHING (linear curves)
    const area = d3.area<PaymentVolumeData>()
      .x(d => x(d.date))
      .y0(y(0))
      .y1(d => y(d.volume));
    // Removed .curve() to use linear interpolation

    // Create line generator for the top edge - NO SMOOTHING
    const line = d3.line<PaymentVolumeData>()
      .x(d => x(d.date))
      .y(d => y(d.volume));
    // Removed .curve() to use linear interpolation

    // Select SVG and set attributes
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;');

    // Add gradient
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('x1', '0%')
      .attr('x2', '0%')
      .attr('y1', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0.8);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0.1);

    // Append area path with animation
    svg.append('path')
      .datum(data)
      .attr('fill', 'url(#area-gradient)')
      .attr('d', area)
      .attr('opacity', 0)
      .transition()
      .duration(1000)
      .attr('opacity', 1);

    // Append line path with animation
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('d', line)
      .attr('stroke-dasharray', function() {
        const length = (this as SVGPathElement).getTotalLength();
        return `${length} ${length}`;
      })
      .attr('stroke-dashoffset', function() {
        return (this as SVGPathElement).getTotalLength();
      })
      .transition()
      .duration(1500)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);

    // Add x-axis
    svg.append('g')
      .attr('transform', `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
      .attr('color', '#9ca3af')
      .selectAll('text')
      .attr('fill', '#9ca3af');

    // Add y-axis with grid lines
    svg.append('g')
      .attr('transform', `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).ticks(height / 40))
      .attr('color', '#9ca3af')
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').clone()
        .attr('x2', width - marginLeft - marginRight)
        .attr('stroke-opacity', 0.1)
        .attr('stroke', '#4b5563'))
      .call(g => g.append('text')
        .attr('x', -marginLeft)
        .attr('y', 10)
        .attr('fill', '#9ca3af')
        .attr('text-anchor', 'start')
        .text('↑ Payment Volume ($)'))
      .selectAll('text')
      .attr('fill', '#9ca3af');

  }, [data, timeframe]);

  return (
    <div className="w-full flex justify-center bg-elevated-surface border-[0.5px] border-border-default rounded-lg p-4">
      <svg ref={svgRef}></svg>
    </div>
  );
};
