#!/bin/bash
NEW_KEY=$(openssl rand -hex 32)
echo "New SECRET_KEY: $NEW_KEY"
echo "Update your .env file with: SECRET_KEY=$NEW_KEY"
echo "WARNING: All existing JWT tokens will be invalidated."
