# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-01

### Added

- Initial release of mcp-server-vector-db
- Multi-provider support: Pinecone, Weaviate, Qdrant, ChromaDB
- `upsert_vectors` tool for inserting and updating vectors with metadata
- `query_vectors` tool for similarity search with filtering and top-K
- `delete_vectors` tool for removing vectors by ID
- `list_collections` tool for listing all available collections
- `create_collection` tool with dimension and metric configuration
- `get_collection_stats` tool for collection statistics
- Environment-based provider configuration
- Docker container for deployment
- Unified provider interface for easy extensibility
