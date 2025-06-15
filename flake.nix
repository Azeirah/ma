{
  description = "Ma-language flake, includes bun and python dependencies";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = nixpkgs.legacyPackages.${system};
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = [ pkgs.bun ];
          shellHook = ''
            ${pkgs.gum}/bin/gum format <<EOF
# Welcome to the ma-lang development environment

Ma (the Japanese word for negative space) is a communal programming language strongly inspired by Dynamicland

- Run tests with \`bun test\`
- You can start the server with \`bun server.ts\`
EOF
'';
        };
      });
}
