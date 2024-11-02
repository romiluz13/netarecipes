{
  description = "Node.js environment";
  deps = [
    pkgs.nodejs-20
    pkgs.nodePackages.npm
    pkgs.nodePackages.typescript
    pkgs.nodePackages.vite
  ];
}
