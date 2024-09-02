set -e
# cd /workspace

if [ -e *.tgz ]; then
    rm *.tgz
fi
rm -rf node_modules
export PATH=/root/.bun/bin:$PATH
corepack enable pnpm
pnpm install
pnpm run build
npx @kksh/cli@latest verify --publish
npm pack
# check number of *.tgz file in current directory
# if more than 1, then exit with error
if [ $(ls -1 *.tgz 2>/dev/null | wc -l) -gt 1 ]; then
    echo "More than one tgz file found"
    exit 1
fi
cp *.tgz /workspace
