let currentNodeIndex = 0;
let currentEdgeIndex = 0;
let state = { nodes: [] };
let cy = (window.cy = cytoscape({
  container: document.getElementById("cy"),

  boxSelectionEnabled: false,
  autounselectify: true,

  layout: {
    name: "dagre"
  },

  style: [
    {
      selector: "node",
      style: {
        content: "data(id)",
        "text-opacity": 0.5,
        "text-valign": "center",
        "text-halign": "right",
        "background-color": "#11479e"
      }
    },

    {
      selector: "edge",
      style: {
        "curve-style": "bezier",
        width: 4,
        "target-arrow-shape": "triangle",
        "line-color": "#9dbaea",
        "target-arrow-color": "#9dbaea"
      }
    }
  ],

  elements: {
    nodes: [{ data: { id: currentNodeIndex, label: currentNodeIndex } }]
  }
}));

function addEdge() {
  const source = document.getElementsByName("newEdge")[0].value;
  const target = document.getElementsByName("newEdge")[1].value;
  const actor = document.getElementsByName("newEdge")[2].value;
  if (source === "" || target === "" || actor === "") {
    alert("New edge cannot be created, null value");
  } else {
    state.nodes[parseInt(source, 10)].connections.push({
      target: target,
      actor: actor
    });
    let edge = cy.add({
      group: "edges",
      data: {
        source: source,
        target: target
      }
    });
    let popper = edge.popper({
      content: () => {
        let div = document.createElement("div");

        div.innerHTML = actor;

        document.body.appendChild(div);

        return div;
      }
    });
    let update = () => {
      popper.scheduleUpdate();
    };
    edge.on("position", update);
    cy.on("click pan zoom resize", update);
  }
  console.log(cy.elements('edge'));
  currentEdgeIndex++;
  document.getElementsByName("newEdge")[0].value = "";
  document.getElementsByName("newEdge")[1].value = "";
  document.getElementsByName("newEdge")[2].value = "";
  internalDSLOutput();
}

function addNode() {
  currentNodeIndex++;
  let current = document.getElementsByName("newNode")[0].value;
  if (current.slice(-6) !== ".class") {
    current = current + ".class";
  }
  cy.add({
    group: "nodes",
    data: { id: currentNodeIndex }
  });
  let node = cy.$()[currentNodeIndex];
  let popper = node.popper({
    content: () => {
      let div = document.createElement("div");

      div.innerHTML = current;

      document.body.appendChild(div);

      return div;
    }
  });
  let update = () => {
    popper.scheduleUpdate();
  };
  node.on("position", update);
  cy.on("pan zoom resize", update);
  state.nodes.push({ id: currentNodeIndex, payload: current, connections: [] });
  document.getElementsByName("newNode")[0].value = "";
  internalDSLOutput();
}

function generateInternalDSLCode(state) {
  return (
    "protocolBuilder\n" +
    state.nodes
      .map(
        x =>
          "  .node()\n    .payload(" +
          x.payload +
          ")\n" +
          generateConnectionsCode(x.connections)
      )
      .join("") +
    ".build();"
  );
}

function generateConnectionsCode(connectionsArray) {
  return connectionsArray
    .map(
      x =>
        "    .connection()\n      .actor(\"" +
        x.actor +
        "\")\n      .to(\"" +
        x.target +
        "\")\n"
    )
    .join("");
}

function internalDSLOutput() {
  if (document.getElementById("outputField") === null) {
    let textArea = document.createElement("TEXTAREA");
    textArea.id = "outputField";
    let inner = document.createTextNode(generateInternalDSLCode(state));
    textArea.appendChild(inner);
    document.getElementById("toolbar").appendChild(textArea);
  } else {
    document.getElementById("outputField").value = generateInternalDSLCode(
      state
    );
  }
}

function initialise() {
  let node = cy.nodes().first();
  let popper = node.popper({
    content: () => {
      let div = document.createElement("div");

      div.innerHTML = "Null";

      document.body.appendChild(div);

      return div;
    }
  });
  let update = () => {
    popper.scheduleUpdate();
  };
  node.on("position", update);
  cy.on("pan zoom resize", update);
}

initialise();
state.nodes.push({ id: 0, payload: "null", connections: [] });
internalDSLOutput();