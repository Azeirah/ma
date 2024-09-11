{ pkgs ? import <nixpkgs> {} }:

let
  baseShell = pkgs.mkShell {
    buildInputs = [
      pkgs.bun
    ];
  };

  maShell = pkgs.mkShell {
    buildInputs = [
      pkgs.bun
    ];
    shellHook = ''
      bun server.ts
    '';
  };
in
baseShell // {
  ma = maShell;
}
