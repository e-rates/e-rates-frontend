import React from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { columns, data } from './table';
import Link from 'next/link';

const Table = () => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <div className="w-full">
      <div className="p-2">
        <p className="text-regular-md tracking-tight text-neutral-400">
          {' '}
          Showing 15 of 15 records
        </p>
      </div>
      <table className="border-border-default w-full border-r-[0.5px]">
        <thead className="bg-panel-bg">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className="grid w-full grid-cols-5 gap-2 py-2"
            >
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="text-regular-md border-r-[0.5px]"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-border-default grid grid-cols-5 gap-2 border-b-[0.5px] py-2 text-center hover:bg-sky-900/30"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="text-regular-md px-2">
                  <Link
                    href={`/dashboard/parcel/${row.original.plotnumber}`}
                    key={row.id}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Link>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
