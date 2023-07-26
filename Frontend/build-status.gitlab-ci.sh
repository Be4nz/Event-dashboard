#!/bin/sh

export REPO_URL=$(jq -r '.pullrequest.source.repository.full_name' $TRIGGER_PAYLOAD)

export PR_ID=$(jq -r '.pullrequest.id' $TRIGGER_PAYLOAD)
export PR_TITLE=$(jq -r '.pullrequest.title' $TRIGGER_PAYLOAD)
export PR_STATUS=$(jq -r '.pullrequest.state' $TRIGGER_PAYLOAD)


export TARGET_BRANCH_NAME=$(jq -r '.pullrequest.destination.branch.name' $TRIGGER_PAYLOAD)


export SOURCE_BRANCH_NAME=$(jq -r '.pullrequest.source.branch.name' $TRIGGER_PAYLOAD)
[[ "$PR_STATUS" == "MERGED" ]] && SOURCE_BRANCH_NAME="$TARGET_BRANCH_NAME"

export SOURCE_COMMIT_SHA=$(jq -r '.pullrequest.source.commit.hash' $TRIGGER_PAYLOAD)
[[ "$PR_STATUS" == "MERGED" ]] && SOURCE_COMMIT_SHA=$(jq -r '.pullrequest.merge_commit.hash' $TRIGGER_PAYLOAD)

echo "TARGET_BRANCH_NAME=$TARGET_BRANCH_NAME" >> build-status.env
echo "SOURCE_BRANCH_NAME=$SOURCE_BRANCH_NAME" >> build-status.env
echo "SOURCE_COMMIT_SHA=$SOURCE_COMMIT_SHA" >> build-status.env
echo "PR_STATUS=$PR_STATUS" >> build-status.env

function status() {
    STATUS=$1
    echo "{\"state\":\"$STATUS\",\"key\":\"$PR_TITLE\",\"name\":\"PR $PR_ID: $SOURCE_BRANCH_NAME â†’ $TARGET_BRANCH_NAME\",\"url\":\"$CI_PIPELINE_URL\",\"description\":\"description\"}" > build.json

    curl -u $BITBUCKET_USER:$BITBUCKET_TOKEN \
        -H "Content-Type:application/json" \
        -X POST https://api.bitbucket.org/2.0/repositories/$REPO_URL/commit/$SOURCE_COMMIT_SHA/statuses/build/ \
        -d @build.json
}

function exec_psql() {
  kubectl exec -it deployment/pg-admin-database -n pg-admin -- psql -U postgres -XtAc "$@"
}

function create_db() {
    USER=$1;
    PASSWORD=$2;

    if [ -z "$USER" ]; then echo "You need to specify your TEAM_NAME which will be used for user and database naming"; exit 1; fi
    if [ -z "$PASSWORD" ]; then echo "You need to specify your DB_PASSWORD as second argument"; exit 1; fi

    if [ "$( exec_psql "SELECT 1 FROM pg_database WHERE datname='$USER'" )" -eq '1' ]
    then
        echo "Database already exists"
    else
        echo "Database does not exist. Creating new user and database..."

        exec_psql "create user \"$USER\" with encrypted password '$PASSWORD';" &&
        exec_psql "create database \"$USER\" with owner=\"$USER\"" &&
        exec_psql "grant all privileges on database \"$USER\" to \"$USER\";"
    fi
}
