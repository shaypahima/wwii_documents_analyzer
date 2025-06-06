import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("drive", "routes/drive.tsx"),
  route("documents", "routes/documents.tsx"),
  route("documents/:id", "routes/document-detail.tsx"),
  route("analyze", "routes/analyze.tsx"),
] satisfies RouteConfig;
