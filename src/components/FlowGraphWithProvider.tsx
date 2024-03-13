import React, { useState, useCallback, useEffect, MouseEvent } from "react";
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background,
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  NodeChange,
  EdgeChange,
  useReactFlow,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";
import CustomEdge from "./CustomEdge.tsx";

interface Task {
  task_name: string;
  sequence: number;
}

interface FlowGraphProps {
  tasks: Task[];
  onTaskParentChange: (node: Node, parentOfDraggedNode: any) => void;
}

const FlowGraph: React.FC<FlowGraphProps> = ({ tasks, onTaskParentChange }) => {
  console.log('2nd')
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const edgeTypes = {
    "custom-edge": (props: any) => (
      <CustomEdge
        eid={props.id}
        isHovering={hoveredEdge === props.id}
        {...props}
      />
    ),
  };

  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  useEffect(() => {
    const sortedTasks = [...tasks].sort((a, b) => a.sequence - b.sequence);
    const sequences = new Set(sortedTasks.map((task) => task.sequence));

    const updatedTasksNodes: any[] = [];
    sequences.forEach((sequence, index) => {
      const tasksInSequence = sortedTasks.filter(
        (task) => task.sequence === sequence
      );
      const parentHeight = tasksInSequence.length * 50 + 60;
      updatedTasksNodes.push({
        id: `sequence_${sequence}`,
        data: { label: `Sequence ${sequence}` },
        position: { x: 250 + index * 300, y: 100 },
        sourcePosition: "right",
        targetPosition: "left",
        style: {
          width: 170,
          height: parentHeight,
        },
      });

      tasksInSequence.forEach((task, taskIndex) => {
        updatedTasksNodes.push({
          id: `node_${index}_${taskIndex}`,
          data: { label: task.task_name },
          position: { x: index + 10, y: 50 + taskIndex * 50 },
          parentNode: `sequence_${sequence}`,
        });
      });
    });
    setNodes(updatedTasksNodes);

    const sequenceNodes = updatedTasksNodes.filter((node) =>
      node.id.startsWith("sequence_")
    );
    const sortedSequenceNodes = sequenceNodes.sort(
      (a, b) => parseInt(a.id.split("_")[1]) - parseInt(b.id.split("_")[1])
    );

    const newEdges: {
      id: string;
      source: any;
      target: any;
      type: string;
      animated: boolean;
    }[] = [];
    for (let i = 0; i < sortedSequenceNodes.length - 1; i++) {
      const sourceNodeId = sortedSequenceNodes[i].id;
      const targetNodeId = sortedSequenceNodes[i + 1].id;
      const edgeId = `edge_sequence_${i}`;
      newEdges.push({
        id: edgeId,
        source: sourceNodeId,
        target: targetNodeId,
        type: "custom-edge",
        animated: true,
      });
    }

    setEdges((prevEdges) => [...newEdges]);
  }, [tasks]);

  useEffect(() => {}, [nodes]);
  const onConnect = useCallback(
    (connection: any) => {
      const edge = { ...connection, type: "custom-edge", animated: true };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const { getIntersectingNodes } = useReactFlow();
  const onNodeDragStop = useCallback(
    (event: MouseEvent, node: Node) => {
      const intersections = getIntersectingNodes(node);
      // The Dragged Node
      const draggedNode = nodes.find((n) => n.id === node.id);
    
      // The Parent Node of the Dragged Node
      if(draggedNode && draggedNode.parentNode) {

        const parentofDraggedNode = draggedNode.parentNode.split("_")[1];
  
        const sequenceNodes = intersections
          .map((intersection) => nodes.find((n) => n.id === intersection.id))
          .filter((n) => n?.id.startsWith("sequence_"));
        // Find the closest parent node
  
        // The new parent node of thge Dragged Node
        const parentNode = sequenceNodes[0];
  
        // If it doesn't exist, add it to the array
        if (parentNode) {
          const updatedNode = {
            ...draggedNode,
            parentNode: parentNode?.id,
          };
          onTaskParentChange(updatedNode, parentofDraggedNode);
        }

      }
    },
    [getIntersectingNodes, nodes,onTaskParentChange]
  );

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

const FlowGraphWithProvider = ({ tasks }) => {
  const [tasklist, setTasklist] = React.useState<any[]>([]);
  console.log('Entry')
  useEffect(() => {
    setTasklist(structuredClone(tasks));
  }, [tasks]);

  function onTaskParentChange(node: any, parentOfDraggedNode: any) {
    const updatedTasks = [...tasklist];
    updatedTasks.forEach((task) => {
      if (task.task_name === node.data.label) {
        task.sequence = parseInt(node.parentNode.split("_")[1]);
      }
    });
    const remainingChildren = updatedTasks.filter(
      (task) => task.sequence === parseInt(parentOfDraggedNode)
    );
    if (remainingChildren.length === 0) {
      const deletedParentNode = parentOfDraggedNode;

      const parentNodesToUpdate = updatedTasks.filter(
        (task) => task.sequence > deletedParentNode
      );

      parentNodesToUpdate.forEach((task) => {
        task.sequence = task.sequence - 1;
      });
    }
    console.log("updated tasks after deleting a whole parent", updatedTasks);
    setTasklist(structuredClone(updatedTasks));
  }
  return (
    <ReactFlowProvider>
      {tasklist.length > 0 && (
        <FlowGraph tasks={tasklist} onTaskParentChange={onTaskParentChange} />
      )}
    </ReactFlowProvider>
  );
};

export default FlowGraphWithProvider;
