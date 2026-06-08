#!/usr/bin/env bash
# Instalador do FreakJS — Mac e Linux
#
# Uso:
#   curl -fsSL https://raw.githubusercontent.com/lucas-s-santos/FreakJS/main/install.sh | bash

set -e

REPO="lucas-s-santos/FreakJS"
INSTALL_DIR="$HOME/.freakjs/bin"
BIN_NAME="freakjs"

# Detecta OS e arquitetura
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
  Linux*)
    case "$ARCH" in
      x86_64)  TARGET="linux-x64" ;;
      aarch64) TARGET="linux-arm64" ;;
      *) echo "Arquitetura não suportada: $ARCH" && exit 1 ;;
    esac
    ;;
  Darwin*)
    case "$ARCH" in
      x86_64)  TARGET="darwin-x64" ;;
      arm64)   TARGET="darwin-arm64" ;;
      *) echo "Arquitetura não suportada: $ARCH" && exit 1 ;;
    esac
    ;;
  *)
    echo "Sistema operacional não suportado: $OS"
    echo "No Windows, use: irm https://raw.githubusercontent.com/$REPO/main/install.ps1 | iex"
    exit 1
    ;;
esac

DOWNLOAD_URL="https://github.com/$REPO/releases/latest/download/freakjs-$TARGET"

echo ""
echo "  FreakJS Installer"
echo "  Sistema: $OS $ARCH → $TARGET"
echo ""

# Cria o diretório de instalação
mkdir -p "$INSTALL_DIR"

# Baixa o binário
echo "  Baixando freakjs..."
curl -fsSL "$DOWNLOAD_URL" -o "$INSTALL_DIR/$BIN_NAME"
chmod +x "$INSTALL_DIR/$BIN_NAME"

echo "  ✓ Instalado em $INSTALL_DIR/$BIN_NAME"

# Adiciona ao PATH se ainda não estiver
add_to_path() {
  local SHELL_RC="$1"
  local LINE='export PATH="$HOME/.freakjs/bin:$PATH"'
  if [ -f "$SHELL_RC" ] && ! grep -q ".freakjs/bin" "$SHELL_RC"; then
    echo "" >> "$SHELL_RC"
    echo "# FreakJS" >> "$SHELL_RC"
    echo "$LINE" >> "$SHELL_RC"
    echo "  ✓ PATH atualizado em $SHELL_RC"
  fi
}

add_to_path "$HOME/.bashrc"
add_to_path "$HOME/.zshrc"
add_to_path "$HOME/.profile"

echo ""
echo "  Instalação concluída!"
echo ""
echo "  Reinicie o terminal ou rode:"
echo "    export PATH=\"\$HOME/.freakjs/bin:\$PATH\""
echo ""
echo "  Depois use:"
echo "    freakjs create meu-projeto"
echo "    cd meu-projeto"
echo "    bun run dev"
echo ""
