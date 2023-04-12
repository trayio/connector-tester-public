import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import bodyParser from "body-parser";
dotenv.config();

const app = express();
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json());

app.get("/test", async (req, res) => {
  res.send("API working");
});

app.get("/userId", async (req, res) => {
  const token = req.header("Authorization").split(" ")[1];
  const response = await fetch("https://api.tray.io/v1/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await response.json();
  res.status(200).send(json);
});

app.get("/users", async (req, res) => {
  const graphql = JSON.stringify({
    query:
      "query {\n    users {\n        edges {\n            node {\n                name\n                id\n                externalUserId\n                isTestUser\n            }\n            cursor\n        }\n        pageInfo {\n          hasNextPage\n          endCursor\n          hasPreviousPage\n          startCursor\n        }\n    }\n}",
    variables: {},
  });

  const requestOptions = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MASTER_TOKEN}`,
    },
    body: graphql,
    redirect: "follow",
  };

  const response = await fetch("https://tray.io/graphql", requestOptions);
  const json = await response.json();
  res.status(200).send(json);
});

app.post("/users", async (req, res) => {
  const graphql = JSON.stringify({
    query:
      "mutation($externalUserId: String!, $name: String!) {\n  createExternalUser(input: { \n      name: $name, \n      externalUserId: $externalUserId \n    }) {\n      userId\n  }\n}",
    variables: {
      name: req.body.name,
      externalUserId: req.body.externalUserId,
    },
  });

  const requestOptions = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MASTER_TOKEN}`,
    },
    body: graphql,
    redirect: "follow",
  };

  const response = await fetch("https://tray.io/graphql", requestOptions);
  const json = await response.json();
  res.status(200).send(json);
});

app.get("/connectors", async (req, res) => {
  const token = req.header("Authorization").split(" ")[1];
  const response = await fetch("https://api.tray.io/core/v1/connectors", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await response.json();
  res.status(200).send(json);
});

app.get(
  "/connectors/:connectorName/versions/:connectorVersion/operations",
  async (req, res) => {
    const token = req.header("Authorization").split(" ")[1];
    const { connectorName, connectorVersion } = { ...req.params };
    const response = await fetch(
      `https://api.tray.io/core/v1/connectors/${connectorName}/versions/${connectorVersion}/operations`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const json = await response.json();
    res.status(200).send(json);
  }
);

app.post("/userToken", async (req, res) => {
  if (req.body.userId === "admin") {
    res.status(200).send({
      accessToken: process.env.MASTER_TOKEN
    });
    return;
  }

  const graphql = JSON.stringify({
    query:
      "mutation ($userId: ID!) {\n  authorize(input: {\n      userId: $userId\n  }) {\n    accessToken\n  }\n}",
    variables: { userId: req.body.userId },
  });

  const requestOptions = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MASTER_TOKEN}`,
    },
    body: graphql,
    redirect: "follow",
  };

  const response = await fetch("https://tray.io/graphql", requestOptions);
  const json = await response.json();
  res.status(200).send(json?.data?.authorize);
});

app.get("/authentications", async (req, res) => {
  const token = req.header("Authorization").split(" ")[1];

  const graphql = JSON.stringify({
    query:
      "query {\n  viewer {\n    authentications {\n      edges {\n        node {\n          id\n          name\n          customFields\n          service {\n            id,\n            name,\n            icon,\n            title,\n            version\n          }\n          serviceEnvironment {\n              id\n              title\n          }\n        }\n      }\n      pageInfo{\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n}",
    variables: {},
  });

  const requestOptions = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: graphql,
    redirect: "follow",
  };

  const response = await fetch("https://tray.io/graphql", requestOptions);
  const json = await response.json();
  res.status(200).send(json);
});

app.get(
  "/services/:serviceName/versions/:serviceVersion/environments",
  async (req, res) => {
    const token = req.header("Authorization").split(" ")[1];
    const { serviceName, serviceVersion } = { ...req.params };
    if (serviceName && serviceVersion) {
      const response = await fetch(
        `https://api.tray.io/core/v1/services/${serviceName}/versions/${serviceVersion}/environments`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const json = await response.json();
      res.status(200).send(json);
    }
  }
);

app.post("/authCode", async (req, res) => {
  const graphql = JSON.stringify({
    query:
      "mutation ($userId: ID!) {\n  generateAuthorizationCode( input: {\n    userId: $userId\n  }) {\n    authorizationCode\n  }\n}",
    variables: { userId: req.body.userId },
  });

  const requestOptions = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MASTER_TOKEN}`,
    },
    body: graphql,
    redirect: "follow",
  };

  const response = await fetch("https://tray.io/graphql", requestOptions);
  const json = await response.json();
  res.status(200).send(json);
});

app.post(
  "/connectors/:connectorName/versions/:connectorVersion/call",
  async (req, res) => {
    const token = req.header("Authorization").split(" ")[1];
    const { connectorName, connectorVersion } = { ...req.params };
    const requestOptions = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(req.body),
    };

    const response = await fetch(
      `https://api.tray.io/core/v1/connectors/${connectorName}/versions/${connectorVersion}/call`,
      requestOptions
    );
    const json = await response.json();
    res.status(200).send(json);
  }
);

app.listen(PORT, () =>
  console.log(`Server running on: http://localhost:${PORT}`)
);

export default app;
