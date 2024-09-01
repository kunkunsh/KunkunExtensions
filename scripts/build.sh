for ext in $(ls extensions); do
    # Check if ext is a directory and contains package.json
    if [ ! -d "extensions/$ext" ] || [ ! -f "extensions/$ext/package.json" ]; then
        echo "Skipping $ext"
        continue
    fi
    echo "Building $ext"
    docker run -v $(pwd)/scripts/docker/entrypoint.sh:/entrypoint.sh \
        -v $(pwd)/extensions/$ext:/workspace \
        -w /workspace --rm \
        --platform=linux/amd64 \
        huakunshen/kunkun-ext-builder:latest /entrypoint.sh
done
