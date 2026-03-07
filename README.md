# mcp-server-vector-db

An MCP (Model Context Protocol) server for vector database operations. Provides a unified interface to interact with Pinecone, Weaviate, Qdrant, and ChromaDB through standard MCP tools.

## Architecture

```mermaid
flowchart TD
    A[MCP Client] -->|stdio| B[MCP Server]
    B --> C{Provider Router}
    C --> D[Pinecone]
    C --> E[Weaviate]
    C --> F[Qdrant]
    C --> G[ChromaDB]

    B --> H[upsert_vectors]
    B --> I[query_vectors]
    B --> J[delete_vectors]
    B --> K[list_collections]
    B --> L[create_collection]
    B --> M[get_collection_stats]

    style A fill:#4A90D9,stroke:#2C5F8A,color:#FFFFFF
    style B fill:#2ECC71,stroke:#1A9B52,color:#FFFFFF
    style C fill:#F39C12,stroke:#C47F0E,color:#FFFFFF
    style D fill:#8E44AD,stroke:#6C3483,color:#FFFFFF
    style E fill:#E74C3C,stroke:#B83A2F,color:#FFFFFF
    style F fill:#1ABC9C,stroke:#148F77,color:#FFFFFF
    style G fill:#3498DB,stroke:#2476AB,color:#FFFFFF
    style H fill:#D4AC0D,stroke:#B7950B,color:#FFFFFF
    style I fill:#D4AC0D,stroke:#B7950B,color:#FFFFFF
    style J fill:#D4AC0D,stroke:#B7950B,color:#FFFFFF
    style K fill:#D4AC0D,stroke:#B7950B,color:#FFFFFF
    style L fill:#D4AC0D,stroke:#B7950B,color:#FFFFFF
    style M fill:#D4AC0D,stroke:#B7950B,color:#FFFFFF
```

## Supported Providers

| Provider | Required Config | Description |
|----------|----------------|-------------|
| **Pinecone** | `VECTOR_API_KEY` | Managed vector database with serverless support |
| **Weaviate** | `VECTOR_HOST`, `VECTOR_API_KEY` (optional) | Open-source vector search engine |
| **Qdrant** | `VECTOR_URL`, `VECTOR_API_KEY` (optional) | High-performance vector similarity engine |
| **ChromaDB** | `VECTOR_HOST` (optional) | Open-source embedding database |

## Tools

| Tool | Description |
|------|-------------|
| `upsert_vectors` | Insert or update vectors with metadata |
| `query_vectors` | Similarity search with filtering |
| `delete_vectors` | Remove vectors by ID |
| `list_collections` | List all collections |
| `create_collection` | Create a new collection with dimension and metric |
| `get_collection_stats` | Get collection statistics |

## Installation

```bash
npm install
npm run build
```

## Configuration

Set environment variables to configure the provider:

```bash
export VECTOR_PROVIDER=pinecone    # pinecone | weaviate | qdrant | chromadb
export VECTOR_API_KEY=your-key
export VECTOR_HOST=your-host
export VECTOR_URL=http://localhost:6333
```

## Usage

### Standalone

```bash
npm start
```

### Docker

```bash
docker build -t mcp-server-vector-db .
docker run -i --rm \
  -e VECTOR_PROVIDER=qdrant \
  -e VECTOR_URL=http://host.docker.internal:6333 \
  mcp-server-vector-db
```

### MCP Client Configuration

```json
{
  "mcpServers": {
    "vector-db": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "VECTOR_PROVIDER": "pinecone",
        "VECTOR_API_KEY": "your-api-key"
      }
    }
  }
}
```

## License

MIT License - see [LICENSE](LICENSE) for details.
