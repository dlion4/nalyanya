"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ExpandedState,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowUpDown,
  Ban,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Ellipsis,
  Eye,
  GitBranch,
  KeyRound,
  MessageCircle,
  QrCode,
  Send,
  ShieldCheck,
  Trash,
  TreeDeciduous,
  UserCog,
  UserPlus,
  X,
} from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { Avatar, BranchChip, GenChip } from "@/components/ui/Primitives";
import type { FamilyRole } from "@/data/dashboard/members";
import { ageOf, cn, kes, maskPhone } from "@/lib/format";
import type { Member } from "@/types/family";
import type { DrawerQuickAction } from "@/views/dashboard/members/MemberDetailDrawer";

interface Props {
  members: Member[];
  allMembers: Member[];
  roleOf: (member: Member) => FamilyRole;
  suspendedIds: Set<string>;
  recentIds: Set<string>;
  view: "table" | "grid";
  canEdit: boolean;
  canAssignRole: boolean;
  canSendLink: boolean;
  canRemove: boolean;
  onInspect: (id: string) => void;
  onAction: (action: DrawerQuickAction, memberId: string) => void;
  onBulkBroadcast: (ids: string[]) => void;
  onBulkBranch: (ids: string[]) => void;
  onBulkExport: (ids: string[]) => void;
  onResetFilters: () => void;
}

function RoleBadge({ role }: { role: FamilyRole }) {
  const tone =
    role === "Family Head"
      ? "ny-chip-solid"
      : role === "Co-Admin / Elder"
        ? "ny-chip-gold"
        : role === "Finance Officer"
          ? "ny-chip-violet"
          : role === "Ward / Minor"
            ? "ny-chip-warning"
            : role === "Member"
              ? "ny-chip-info"
              : "";
  return <span className={cn("ny-chip", tone)}>{role}</span>;
}

/** S3 — TanStack Table v8 (sortable, expandable relations, bulk select, Actions menu) + 3D Avatar Grid. */
export function MembersTableAndGrid(props: Props) {
  const {
    members,
    allMembers,
    roleOf,
    suspendedIds,
    recentIds,
    view,
    canEdit,
    canAssignRole,
    canSendLink,
    canRemove,
    onInspect,
    onAction,
    onBulkBroadcast,
    onBulkBranch,
    onBulkExport,
    onResetFilters,
  } = props;

  const [sorting, setSorting] = useState<SortingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const byId = useMemo(() => new Map(allMembers.map((m) => [m.id, m])), [allMembers]);

  const childrenByParent = useMemo(() => {
    const map = new Map<string, Member[]>();
    for (const m of allMembers) {
      if (!m.parentId) continue;
      const list = map.get(m.parentId) ?? [];
      list.push(m);
      map.set(m.parentId, list);
    }
    return map;
  }, [allMembers]);

  const columns = useMemo<ColumnDef<Member>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        header: ({ table }) => (
          <input
            type="checkbox"
            aria-label="Select all members on this page"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="size-4 cursor-pointer rounded border-hairline accent-brand-primary"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={`Select ${row.original.preferredName} ${row.original.lastName}`}
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="size-4 cursor-pointer rounded border-hairline accent-brand-primary"
          />
        ),
      },
      {
        id: "expand",
        enableSorting: false,
        header: () => <span className="sr-only">Expand</span>,
        cell: ({ row }) => (
          <button
            type="button"
            onClick={row.getToggleExpandedHandler()}
            aria-label={row.getIsExpanded() ? "Collapse relations" : "Expand relations"}
            aria-expanded={row.getIsExpanded()}
            className="grid size-7 place-items-center rounded-lg text-text-tertiary transition hover:bg-surface-2 hover:text-text-primary"
          >
            {row.getIsExpanded() ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
        ),
      },
      {
        id: "name",
        accessorFn: (m) => `${m.preferredName} ${m.lastName}`,
        header: "Member",
        cell: ({ row }) => {
          const m = row.original;
          const isSuspended = suspendedIds.has(m.id);
          return (
            <button
              type="button"
              onClick={() => onInspect(m.id)}
              className="group flex items-center gap-3 text-left"
            >
              <Avatar member={m} size={40} />
              <span className="min-w-0">
                <span className="block truncate font-semibold text-text-primary group-hover:text-brand-primary group-hover:underline">
                  {m.preferredName} {m.lastName}
                  {m.deathYear !== undefined && <span className="ml-1 text-text-tertiary">†</span>}
                </span>
                <span className="block truncate font-mono text-[11px] text-text-tertiary">
                  {m.id}
                  {isSuspended && <span className="ml-2 font-sans font-semibold text-danger">· Suspended</span>}
                </span>
              </span>
            </button>
          );
        },
      },
      {
        id: "accessRole",
        accessorFn: (m) => roleOf(m),
        header: "Role",
        cell: ({ row }) => <RoleBadge role={roleOf(row.original)} />,
      },
      {
        accessorKey: "generation",
        header: "Gen",
        cell: ({ row }) => <GenChip generation={row.original.generation} />,
      },
      {
        accessorKey: "branchId",
        header: "Branch",
        cell: ({ row }) => <BranchChip branchId={row.original.branchId} />,
      },
      {
        id: "age",
        accessorFn: (m) => ageOf(m.birthYear, m.deathYear),
        header: "Age",
        cell: ({ row }) => {
          const m = row.original;
          return (
            <span className="ny-num font-medium text-text-primary">
              {ageOf(m.birthYear, m.deathYear)}
              {m.deathYear !== undefined && <span className="ml-1 text-xs text-text-tertiary">({m.deathYear})</span>}
            </span>
          );
        },
      },
      {
        id: "home",
        accessorFn: (m) => `${m.homeTown}, ${m.county}`,
        header: "Home",
        cell: ({ row }) => (
          <span className="block max-w-[10rem] truncate text-text-secondary" title={`${row.original.homeTown}, ${row.original.county}`}>
            {row.original.homeTown}
            <span className="block text-[11px] text-text-tertiary">{row.original.county}</span>
          </span>
        ),
      },
      {
        id: "phone",
        enableSorting: false,
        header: "Phone",
        cell: ({ row }) => (
          <span className="ny-num font-mono text-xs text-text-secondary">{maskPhone(row.original.phone)}</span>
        ),
      },
      {
        accessorKey: "saccoShares",
        header: "Shares",
        cell: ({ row }) => (
          <span className="ny-num font-semibold text-text-primary">
            {row.original.saccoShares}
            {row.original.activeLoans > 0 && (
              <span className="ml-1.5 rounded-full bg-[#fbe5e5] px-1.5 py-0.5 text-[10px] font-bold text-danger">
                {row.original.activeLoans}L
              </span>
            )}
          </span>
        ),
      },
      {
        accessorKey: "walletKes",
        header: "Wallet",
        cell: ({ row }) => (
          <span className="ny-num font-mono text-xs font-semibold text-text-primary">
            {kes(row.original.walletKes, { compact: true })}
          </span>
        ),
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const m = row.original;
          const isSuspended = suspendedIds.has(m.id);
          return (
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => onInspect(m.id)}
                className="ny-btn ny-btn-quiet ny-btn-sm !min-h-[32px] !px-2.5 text-xs"
              >
                View
              </button>
              <Menu>
                <MenuButton
                  aria-label={`Actions for ${m.preferredName} ${m.lastName}`}
                  className="grid size-8 place-items-center rounded-xl border border-hairline bg-surface-1 text-text-secondary transition hover:border-brand-primary hover:text-brand-primary"
                >
                  <Ellipsis className="size-4" aria-hidden />
                </MenuButton>
                <MenuItems
                  anchor="bottom end"
                  className="z-50 mt-1.5 w-60 rounded-2xl border border-hairline bg-surface-1 p-1.5 shadow-lift focus:outline-none"
                >
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        type="button"
                        onClick={() => onInspect(m.id)}
                        className={cn("flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm", focus && "bg-surface-2")}
                      >
                        <Eye className="size-4 text-text-tertiary" aria-hidden /> View profile drawer
                      </button>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ focus }) => (
                      <Link
                        href={`/dashboard/lineage?focus=${m.id}`}
                        className={cn("flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm", focus && "bg-surface-2")}
                      >
                        <TreeDeciduous className="size-4 text-text-tertiary" aria-hidden /> Focus in 3D tree
                      </Link>
                    )}
                  </MenuItem>
                  {canEdit && (
                    <MenuItem>
                      {({ focus }) => (
                        <button
                          type="button"
                          onClick={() => onAction("edit-member", m.id)}
                          className={cn("flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm", focus && "bg-surface-2")}
                        >
                          <ShieldCheck className="size-4 text-text-tertiary" aria-hidden /> Edit details
                        </button>
                      )}
                    </MenuItem>
                  )}
                  {canAssignRole && (
                    <MenuItem>
                      {({ focus }) => (
                        <button
                          type="button"
                          onClick={() => onAction("assign-role", m.id)}
                          className={cn("flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm", focus && "bg-surface-2")}
                        >
                          <UserCog className="size-4 text-text-tertiary" aria-hidden /> Assign RBAC role
                        </button>
                      )}
                    </MenuItem>
                  )}
                  {canSendLink && (
                    <MenuItem>
                      {({ focus }) => (
                        <button
                          type="button"
                          onClick={() => onAction("receive-link", m.id)}
                          className={cn("flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm", focus && "bg-surface-2")}
                        >
                          <KeyRound className="size-4 text-brand-accent" aria-hidden /> Send elder receive link
                        </button>
                      )}
                    </MenuItem>
                  )}
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        type="button"
                        onClick={() => onAction("message", m.id)}
                        className={cn("flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm", focus && "bg-surface-2")}
                      >
                        <MessageCircle className="size-4 text-text-tertiary" aria-hidden /> Message member
                      </button>
                    )}
                  </MenuItem>
                  {canEdit && (
                    <MenuItem>
                      {({ focus }) => (
                        <button
                          type="button"
                          onClick={() => onAction("add-relation", m.id)}
                          className={cn("flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm", focus && "bg-surface-2")}
                        >
                          <UserPlus className="size-4 text-text-tertiary" aria-hidden /> Link relation
                        </button>
                      )}
                    </MenuItem>
                  )}
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        type="button"
                        onClick={() => onAction("member-qr", m.id)}
                        className={cn("flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm", focus && "bg-surface-2")}
                      >
                        <QrCode className="size-4 text-text-tertiary" aria-hidden /> Digital ID & QR card
                      </button>
                    )}
                  </MenuItem>
                  {canEdit && (
                    <MenuItem>
                      {({ focus }) => (
                        <button
                          type="button"
                          onClick={() => onAction("suspend", m.id)}
                          className={cn("flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-[#8a5d00]", focus && "bg-[#fbf0d6]")}
                        >
                          <Ban className="size-4" aria-hidden /> {isSuspended ? "Restore member" : "Suspend member"}
                        </button>
                      )}
                    </MenuItem>
                  )}
                  {canRemove && (
                    <MenuItem>
                      {({ focus }) => (
                        <button
                          type="button"
                          onClick={() => onAction("remove", m.id)}
                          className={cn("flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-danger", focus && "bg-[#fbe5e5]")}
                        >
                          <Trash className="size-4" aria-hidden /> Remove member…
                        </button>
                      )}
                    </MenuItem>
                  )}
                </MenuItems>
              </Menu>
            </div>
          );
        },
      },
    ],
    [canAssignRole, canEdit, canRemove, canSendLink, onAction, onInspect, roleOf, suspendedIds],
  );

  const table = useReactTable({
    data: members,
    columns,
    getRowId: (row) => row.id,
    state: { sorting, expanded, rowSelection },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 12 } },
  });

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);

  if (members.length === 0) {
    return (
      <div className="ny-card p-10 text-center">
        <p className="ny-eyebrow">No match</p>
        <h3 className="ny-title mt-2 text-2xl">No family member matches those filters</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
          Try clearing one of your active filters or searching with a shorter name or NY-MBR ID.
        </p>
        <button type="button" onClick={onResetFilters} className="ny-btn ny-btn-primary mt-5">
          Reset all filters
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Floating Glassmorphic Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="ny-bulk-hud sticky top-20 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 text-white"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-8 place-items-center rounded-full bg-brand-accent font-mono text-xs font-bold text-brand-deep">
                {selectedIds.length}
              </span>
              <p className="text-sm font-semibold">
                {selectedIds.length === 1 ? "1 member selected" : `${selectedIds.length} members selected`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onBulkBroadcast(selectedIds)}
                className="ny-btn ny-btn-gold ny-btn-sm"
              >
                <Send className="size-3.5" aria-hidden />
                Broadcast to selected
              </button>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => onBulkBranch(selectedIds)}
                  className="ny-btn ny-btn-dark ny-btn-sm"
                >
                  <GitBranch className="size-3.5" aria-hidden />
                  Transfer branch
                </button>
              )}
              <button
                type="button"
                onClick={() => onBulkExport(selectedIds)}
                className="ny-btn ny-btn-dark ny-btn-sm"
              >
                <Download className="size-3.5" aria-hidden />
                Export CSV
              </button>
              <button
                type="button"
                onClick={() => setRowSelection({})}
                aria-label="Clear selection"
                className="ny-btn ny-btn-dark ny-btn-sm size-9 p-0"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {view === "table" ? (
        <div className="ny-card overflow-hidden">
          {/* Desktop / Tablet TanStack Table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[66rem] text-left text-sm">
              <caption className="sr-only">Nalyanya family members directory</caption>
              <thead className="border-b border-hairline bg-surface-0/80 text-xs uppercase tracking-[0.1em] text-text-tertiary">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((header) => {
                      const canSort = header.column.getCanSort();
                      return (
                        <th key={header.id} scope="col" className="px-3 py-3.5 first:pl-5 last:pr-5 font-semibold">
                          {header.isPlaceholder ? null : canSort ? (
                            <button
                              type="button"
                              onClick={header.column.getToggleSortingHandler()}
                              className="inline-flex items-center gap-1.5 transition hover:text-brand-primary"
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              <ArrowUpDown className="size-3 opacity-60" aria-hidden />
                            </button>
                          ) : (
                            flexRender(header.column.columnDef.header, header.getContext())
                          )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-hairline">
                {table.getRowModel().rows.map((row) => {
                  const m = row.original;
                  const parent = m.parentId ? byId.get(m.parentId) : undefined;
                  const spouse = m.spouseId ? byId.get(m.spouseId) : undefined;
                  const kids = childrenByParent.get(m.id) ?? [];
                  const isNew = recentIds.has(m.id);

                  return (
                    <Fragment key={row.id}>
                      <tr
                        className={cn(
                          "transition hover:bg-surface-0/75",
                          row.getIsSelected() && "bg-brand-accent-soft/35",
                          suspendedIds.has(m.id) && "opacity-65",
                          isNew && "ny-row-in",
                        )}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-3 py-3 first:pl-5 last:pr-5">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                      {row.getIsExpanded() && (
                        <tr className="bg-surface-0/75">
                          <td colSpan={columns.length} className="px-6 py-4">
                            <div className="grid gap-4 rounded-2xl border border-hairline bg-surface-1 p-4 md:grid-cols-[1.2fr_1fr_auto] md:items-center">
                              <div className="space-y-1.5">
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-secondary">
                                  Mini relations summary · {m.preferredName}
                                </p>
                                <div className="flex flex-wrap gap-2 text-xs text-text-secondary">
                                  <span className="ny-chip">
                                    Parent: {parent ? `${parent.preferredName} ${parent.lastName}` : "Root / in-law"}
                                  </span>
                                  <span className="ny-chip">
                                    Spouse: {spouse ? `${spouse.preferredName} ${spouse.lastName}` : "None on file"}
                                  </span>
                                  <span className="ny-chip">Children: {kids.length}</span>
                                  <span className="ny-chip">Profession: {m.profession}</span>
                                </div>
                              </div>
                              <p className="line-clamp-2 text-xs leading-relaxed text-text-secondary">{m.bio}</p>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => onInspect(m.id)}
                                  className="ny-btn ny-btn-primary ny-btn-sm"
                                >
                                  Full 6-tab drawer
                                </button>
                                <Link href={`/dashboard/lineage?focus=${m.id}`} className="ny-btn ny-btn-ghost ny-btn-sm">
                                  3D tree →
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile (< md) Stacked Cards */}
          <ul className="divide-y divide-hairline md:hidden">
            {table.getRowModel().rows.map((row) => {
              const m = row.original;
              return (
                <li key={row.id} className={cn("p-4", recentIds.has(m.id) && "ny-row-in")}>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      aria-label={`Select ${m.preferredName}`}
                      checked={row.getIsSelected()}
                      onChange={row.getToggleSelectedHandler()}
                      className="mt-2 size-4 accent-brand-primary"
                    />
                    <Avatar member={m} size={46} />
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => onInspect(m.id)}
                        className="text-left font-semibold text-text-primary hover:text-brand-primary"
                      >
                        {m.preferredName} {m.lastName}
                      </button>
                      <p className="font-mono text-[11px] text-text-tertiary">
                        {m.id} · age {ageOf(m.birthYear, m.deathYear)} · {m.homeTown}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <RoleBadge role={roleOf(m)} />
                        <GenChip generation={m.generation} />
                        <BranchChip branchId={m.branchId} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-hairline pt-3 text-xs">
                    <span className="ny-num font-mono text-text-secondary">
                      {m.saccoShares} sh · {kes(m.walletKes, { compact: true })}
                    </span>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => onInspect(m.id)} className="ny-btn ny-btn-primary ny-btn-sm">
                        Open
                      </button>
                      {canSendLink && (
                        <button
                          type="button"
                          onClick={() => onAction("receive-link", m.id)}
                          className="ny-btn ny-btn-gold ny-btn-sm"
                        >
                          Link
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        /* 3D Perspective Avatar Grid View */
        <div className="ny-stage-3d grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {table.getRowModel().rows.map((row) => {
            const m = row.original;
            const isSuspended = suspendedIds.has(m.id);
            return (
              <article
                key={row.id}
                className={cn(
                  "ny-card ny-card-3d flex flex-col overflow-hidden",
                  isSuspended && "opacity-70",
                  recentIds.has(m.id) && "ny-row-in",
                )}
              >
                <div className="relative h-36 bg-brand-deep">
                  {m.photo ? (
                    <img
                      src={m.photo}
                      alt={`Portrait of ${m.preferredName}`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center bg-gradient-to-br from-brand-primary to-brand-deep">
                      <Avatar member={m} size={64} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                  <div className="absolute left-3 top-3 flex items-center gap-2">
                    <input
                      type="checkbox"
                      aria-label={`Select ${m.preferredName}`}
                      checked={row.getIsSelected()}
                      onChange={row.getToggleSelectedHandler()}
                      className="size-4 cursor-pointer rounded accent-brand-accent"
                    />
                    <GenChip generation={m.generation} className="!bg-black/55 !text-white !border-white/20" />
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="truncate font-display text-lg font-semibold leading-tight">
                      {m.preferredName} {m.lastName}
                    </p>
                    <p className="truncate text-xs text-white/80">
                      {m.homeTown}, {m.county} · age {ageOf(m.birthYear, m.deathYear)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <div className="flex flex-wrap gap-1.5">
                    <RoleBadge role={roleOf(m)} />
                    <BranchChip branchId={m.branchId} />
                  </div>
                  <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-text-secondary">{m.profession} — {m.bio}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-surface-0/80 p-2.5 text-center text-xs">
                    <div>
                      <p className="text-[10px] uppercase text-text-tertiary">Sacco shares</p>
                      <p className="ny-num font-semibold text-text-primary">{m.saccoShares}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-text-tertiary">Wallet</p>
                      <p className="ny-num font-semibold text-text-primary">{kes(m.walletKes, { compact: true })}</p>
                    </div>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                    <button
                      type="button"
                      onClick={() => onInspect(m.id)}
                      className="ny-btn ny-btn-primary ny-btn-sm flex-1"
                    >
                      Inspect
                    </button>
                    <button
                      type="button"
                      onClick={() => onAction("member-qr", m.id)}
                      aria-label={`ID Card for ${m.preferredName}`}
                      className="ny-btn ny-btn-ghost ny-btn-sm size-9 p-0"
                    >
                      <QrCode className="size-4" aria-hidden />
                    </button>
                    {canSendLink && (
                      <button
                        type="button"
                        onClick={() => onAction("receive-link", m.id)}
                        aria-label={`Send receive link to ${m.preferredName}`}
                        className="ny-btn ny-btn-gold ny-btn-sm size-9 p-0"
                      >
                        <KeyRound className="size-4" aria-hidden />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      <div className="ny-card flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-sm">
        <div className="flex items-center gap-2 text-text-secondary">
          <span>Rows per page:</span>
          <select
            aria-label="Rows per page"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="rounded-xl border border-hairline bg-surface-0 px-2.5 py-1.5 text-xs font-semibold text-text-primary"
          >
            {[12, 24, 48].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <p className="ny-num text-xs font-semibold text-text-secondary">
          Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
        </p>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="ny-btn ny-btn-ghost ny-btn-sm"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Previous
          </button>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="ny-btn ny-btn-ghost ny-btn-sm"
          >
            Next
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
