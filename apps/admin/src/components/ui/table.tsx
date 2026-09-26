'use client';

import type { ColumnDef } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { Input } from './forms';

interface TableFoundationProps<TData> {
  caption: string;
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  emptyMessage?: string;
}

export function TableFoundation<TData>({
  caption,
  columns,
  data,
  emptyMessage = 'No records to show.',
}: TableFoundationProps<TData>) {
  // TanStack Table exposes unstable functions; React Compiler skips this hook.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <div className="overflow-x-auto rounded-lg border border-graphite/20 bg-white">
      <table className="w-full border-collapse text-left text-sm leading-6">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-coolSurface">
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th
                  key={header.id}
                  scope="col"
                  className="border-b border-graphite/20 px-3 py-2 font-semibold text-deepCharcoal"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-2 py-3 text-graphite">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-graphite/20 last:border-0"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-3 py-2 align-top text-graphite"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function FilterControl({
  value,
  onChange,
  label = 'Filter records',
}: {
  value: string;
  onChange(value: string): void;
  label?: string;
}) {
  return (
    <div className="relative max-w-sm">
      <Input
        label={label}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pl-4"
      />
      <MagnifyingGlass
        aria-hidden="true"
        size={16}
        className="pointer-events-none absolute bottom-3 left-1 text-graphite"
      />
    </div>
  );
}
