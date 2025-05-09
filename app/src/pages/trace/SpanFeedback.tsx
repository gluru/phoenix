import React, { useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { css } from "@emotion/react";

import { JSONText } from "@phoenix/components/code/JSONText";
import { PreformattedTextCell } from "@phoenix/components/table";
import { tableCSS } from "@phoenix/components/table/styles";
import { TableEmpty } from "@phoenix/components/table/TableEmpty";
import { AnnotatorKindToken } from "@phoenix/components/trace/AnnotatorKindToken";
import { SpanAnnotationActionMenu } from "@phoenix/components/trace/SpanAnnotationActionMenu";
import { useNotifyError, useNotifySuccess } from "@phoenix/contexts";

import {
  SpanFeedback_annotations$data,
  SpanFeedback_annotations$key,
} from "./__generated__/SpanFeedback_annotations.graphql";
import { SpanAnnotationsEmpty } from "./SpanAnnotationsEmpty";

type TableRow = SpanFeedback_annotations$data["spanAnnotations"][number] & {
  spanNodeId: string;
};

const spanAnnotationsTableWrapCSS = css`
  overflow: auto;
`;

function SpanAnnotationsTable({
  annotations,
  spanNodeId,
}: {
  annotations: SpanFeedback_annotations$data["spanAnnotations"];
  spanNodeId: string;
}) {
  const tableData = useMemo<TableRow[]>(() => {
    return annotations.map((annotation) => ({
      ...annotation,
      spanNodeId,
    }));
  }, [annotations, spanNodeId]);
  const notifySuccess = useNotifySuccess();
  const notifyError = useNotifyError();

  const columns: ColumnDef<TableRow>[] = useMemo(
    () => [
      {
        header: "name",
        accessorKey: "name",
        size: 100,
      },
      {
        header: "annotator kind",
        accessorKey: "annotatorKind",
        size: 100,
        cell: ({ row }) => {
          const annotatorKind = row.original.annotatorKind;
          return <AnnotatorKindToken kind={annotatorKind} />;
        },
      },
      {
        header: "label",
        accessorKey: "label",
        size: 100,
      },
      {
        header: "score",
        accessorKey: "score",
        size: 100,
      },
      {
        header: "explanation",
        accessorKey: "explanation",
        cell: PreformattedTextCell,
        size: 400,
      },
      {
        header: "metadata",
        accessorKey: "metadata",
        minSize: 100,
        cell: ({ row }) => {
          const metadata = row.original.metadata;
          return metadata ? (
            <JSONText json={metadata} collapseSingleKey={false} />
          ) : (
            "--"
          );
        },
      },
      {
        header: "",
        accessorKey: "actions",
        size: 100,
        cell: ({ row }) => {
          return (
            <SpanAnnotationActionMenu
              buttonVariant="default"
              buttonSize="compact"
              annotationId={row.original.id}
              spanNodeId={row.original.spanNodeId}
              annotationName={row.original.name}
              onSpanAnnotationActionSuccess={notifySuccess}
              onSpanAnnotationActionError={(error) => {
                notifyError({
                  title: "Failed to update span annotation",
                  message: error.message,
                });
              }}
            />
          );
        },
      },
    ],
    [notifyError, notifySuccess]
  );

  const table = useReactTable({
    columns,
    data: tableData,
    getCoreRowModel: getCoreRowModel(),
  });
  const rows = table.getRowModel().rows;
  const isEmpty = rows.length === 0;

  return (
    <div css={spanAnnotationsTableWrapCSS}>
      <table css={tableCSS} data-testid="span-annotations-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th colSpan={header.colSpan} key={header.id}>
                  {header.isPlaceholder ? null : (
                    <>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        {isEmpty ? (
          <TableEmpty />
        ) : (
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{
                      width: cell.column.getSize(),
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        )}
      </table>
    </div>
  );
}

export function SpanFeedback({ span }: { span: SpanFeedback_annotations$key }) {
  const data = useFragment(
    graphql`
      fragment SpanFeedback_annotations on Span {
        id
        spanAnnotations {
          id
          name
          label
          score
          explanation
          metadata
          annotatorKind
        }
      }
    `,
    span
  );

  const annotations = data.spanAnnotations;

  const hasAnnotations = data.spanAnnotations.length > 0;
  return hasAnnotations ? (
    <SpanAnnotationsTable annotations={annotations} spanNodeId={data.id} />
  ) : (
    <SpanAnnotationsEmpty />
  );
}
