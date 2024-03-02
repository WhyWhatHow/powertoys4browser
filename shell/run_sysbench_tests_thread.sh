#!/bin/bash

# MySQL数据库信息
MYSQL_HOST="127.0.0.1"
MYSQL_PORT="3306"
MYSQL_USER="root"
MYSQL_PASSWORD="your_password"
MYSQL_DB="sbtest"

# Sysbench配置
SYSBENCH_TEST_PATH="/usr/share/sysbench"
SYSBENCH_TEST_DURATION="60"
SYSBENCH_TABLES="10"
SYSBENCH_TABLE_SIZE="1000"

# 用户指定的线程数量，默认为1
THREAD_COUNT=${1:-1}

# 基准测试文件夹
BASE_FOLDER="sysbench_results"

# 创建结果文件夹
FOLDER="sysbench_${MYSQL_DB}_${THREAD_COUNT}thread"
mkdir -p "${BASE_FOLDER}/${FOLDER}"

# 测试脚本数组
declare -a TEST_SCRIPTS=("oltp_read_write.lua" "oltp_read_only.lua"  "oltp_write_only.lua" "oltp_update_index.lua" "oltp_update_non_index.lua" "oltp_insert.lua" "oltp_delete.lua")

# 执行Sysbench测试
for TEST_SCRIPT in "${TEST_SCRIPTS[@]}"; do
  sysbench "${SYSBENCH_TEST_PATH}/${TEST_SCRIPT}" \
    --mysql-host=$MYSQL_HOST \
    --mysql-port=$MYSQL_PORT \
    --mysql-user=$MYSQL_USER \
    --mysql-password=$MYSQL_PASSWORD \
    --mysql-db=$MYSQL_DB \
    --db-driver=mysql \
    --time=$SYSBENCH_TEST_DURATION \
    --threads=$THREAD_COUNT \
    --tables=$SYSBENCH_TABLES \
    --table-size=$SYSBENCH_TABLE_SIZE run > "${BASE_FOLDER}/${FOLDER}/${TEST_SCRIPT%.lua}.txt"
done