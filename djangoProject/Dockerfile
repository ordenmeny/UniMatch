FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim

WORKDIR /djangoapp

EXPOSE 9000

ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy
ENV UV_TOOL_BIN_DIR=/usr/local/bin
ENV PATH="/djangoapp/.venv/bin:$PATH"

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    postgresql-client \
    libpq-dev \
    libssl-dev \
    libpq5 \
    build-essential && \

    mkdir -p /vol/web/media && \
    mkdir -p /vol/web/static && \
    rm -rf /var/lib/apt/lists/*

COPY ./pyproject.toml ./uv.lock ./

RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --locked --no-install-project --group prod

COPY . /djangoapp

# RUN addgroup --system django && \
#     adduser --system --ingroup django --home /djangoapp django && \
#     chown -R django:django /djangoapp && \
#     chmod +x /djangoapp/run_uwsgi.sh && \
#     chown -R django:django /vol && \
#     chmod -R 755 /vol

RUN chmod +x /djangoapp/run_uwsgi.sh

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --group prod


ENTRYPOINT []
CMD ["./run_uwsgi.sh"]
