{
  description = "Ma-language flake, includes bun and python dependencies";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, flake-utils, }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [
            (final: prev: {
              opencv4 = prev.opencv4.override {
                enableGtk2 = true;
                enablePython = true;
              };
            })
          ];
        };
        python =
          pkgs.python3.withPackages (ps: with ps; [ opencv4 numpy redis ]);
        hyprlandPkgs = if pkgs.stdenv.isLinux then [pkgs.hyprland] else [];
      in {
        devShells.default = pkgs.mkShell rec {
          buildInputs = [
            pkgs.zlib
            pkgs.stdenv.cc.cc.lib
            pkgs.libGL
            pkgs.glib
            pkgs.gtk2
            pkgs.pkg-config
            pkgs.nodejs
          ] ++ hyprlandPkgs;
          packages = [ pkgs.bun python ];
          LD_LIBRARY_PATH = "${pkgs.lib.makeLibraryPath buildInputs}";
          shellHook = ''
            ${pkgs.gum}/bin/gum format <<EOF
            # Welcome to the ma-lang development environment
            Ma (the Japanese word for negative space) is a communal programming language strongly inspired by Dynamicland

            ## Other development stuff

            - Run tests with \`bun test\`

            ## Run a dynamicland environment

            - First, start redis with `docker compose up -d`
            - Start the server with \`bun server.ts\`
            - Run the aruco tags detection with \`python arucam/aruco.py\`

            EOF
          '';
        };
      });
}
