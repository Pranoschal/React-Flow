import React from "react";
import { Cross2Icon } from "@radix-ui/react-icons"
import {
  BaseEdge,
  EdgeLabelRenderer,
  useReactFlow,
  getSmoothStepPath,
} from "reactflow";

interface CustomEdgeProps {
  id: string;
  eid: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  isHovering: string;
}

const CustomEdge: React.FC<CustomEdgeProps> = ({
  id,
  eid,
  sourceX,
  sourceY,
  targetX,
  targetY,
  isHovering,
}) => {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      {isHovering && id === eid && (
        <EdgeLabelRenderer>
          <button
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
              background: "#dc143c",
              borderRadius: 10,
            }}
            className="nodrag nopan red"
            onClick={() => {
              setEdges((es) => es.filter((e) => e.id !== id));
            }}
          >
            <Cross2Icon />
          </button>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default CustomEdge;
