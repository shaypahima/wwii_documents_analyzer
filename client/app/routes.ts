import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Public routes
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  
  // Public document and entity routes
  route("documents", "routes/documents.tsx"),
  route("documents/:id", "routes/document-detail.tsx"),
  route("entities", "routes/entities.tsx"),
  route("entities/:id", "routes/entity-detail.tsx"),
  
  // Protected routes (require authentication)
  route("drive", "routes/drive.tsx"),
  route("analyze", "routes/analyze.tsx"),
  route("profile", "routes/profile.tsx"),
] satisfies RouteConfig;