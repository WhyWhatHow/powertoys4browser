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
THREAD_COUNTS=(1 4 8 12 16 20) # 举例不同线程数

# 基准测试文件夹
BASE_FOLDER="sysbench_results"

# 为每种线程计数创建文件夹
for THREADS in "${THREAD_COUNTS[@]}"; do
  
  FOLDER="sysbench_${MYSQL_DB}_${THREADS}thread"
  mkdir -p "${BASE_FOLDER}/${FOLDER}"
  # 只读
 sysbench "${SYSBENCH_TEST_PATH}/oltp_read_only.lua" \
    --mysql-host=$MYSQL_HOST \
    --mysql-port=$MYSQL_PORT \
    --mysql-user=$MYSQL_USER \
    --mysql-password=$MYSQL_PASSWORD \
    --mysql-db=$MYSQL_DB \
    --db-driver=mysql \
    --time=$SYSBENCH_TEST_DURATION \
    --threads=$THREADS \
    --tables=$SYSBENCH_TABLES \
    --table-size=$SYSBENCH_TABLE_SIZE run > "${BASE_FOLDER}/${FOLDER}/oltp_read_only.txt"
  # 读写
  sysbench "${SYSBENCH_TEST_PATH}/oltp_read_write.lua" \
    --mysql-host=$MYSQL_HOST \
    --mysql-port=$MYSQL_PORT \
    --mysql-user=$MYSQL_USER \
    --mysql-password=$MYSQL_PASSWORD \
    --mysql-db=$MYSQL_DB \
    --db-driver=mysql \
    --time=$SYSBENCH_TEST_DURATION \
    --threads=$THREADS \
    --tables=$SYSBENCH_TABLES \
    --table-size=$SYSBENCH_TABLE_SIZE run > "${BASE_FOLDER}/${FOLDER}/oltp_read_write.txt"

  # 只写
  sysbench "${SYSBENCH_TEST_PATH}/oltp_write_only.lua" \
    --mysql-host=$MYSQL_HOST \
    --mysql-port=$MYSQL_PORT \
    --mysql-user=$MYSQL_USER \
    --mysql-password=$MYSQL_PASSWORD \
    --mysql-db=$MYSQL_DB \
    --db-driver=mysql \
    --time=$SYSBENCH_TEST_DURATION \
    --threads=$THREADS \
    --tables=$SYSBENCH_TABLES \
    --table-size=$SYSBENCH_TABLE_SIZE run > "${BASE_FOLDER}/${FOLDER}/oltp_write_only.txt"

  # 更新索引
  sysbench "${SYSBENCH_TEST_PATH}/oltp_update_index.lua" \
    --mysql-host=$MYSQL_HOST \
    --mysql-port=$MYSQL_PORT \
    --mysql-user=$MYSQL_USER \
    --mysql-password=$MYSQL_PASSWORD \
    --mysql-db=$MYSQL_DB \
    --db-driver=mysql \
    --time=$SYSBENCH_TEST_DURATION \
    --threads=$THREADS \
    --tables=$SYSBENCH_TABLES \
    --table-size=$SYSBENCH_TABLE_SIZE run > "${BASE_FOLDER}/${FOLDER}/oltp_update_index.txt"

  # 更新非索引
  sysbench "${SYSBENCH_TEST_PATH}/oltp_update_non_index.lua" \
    --mysql-host=$MYSQL_HOST \
    --mysql-port=$MYSQL_PORT \
    --mysql-user=$MYSQL_USER \
    --mysql-password=$MYSQL_PASSWORD \
    --mysql-db=$MYSQL_DB \
    --db-driver=mysql \
    --time=$SYSBENCH_TEST_DURATION \
    --threads=$THREADS \
    --tables=$SYSBENCH_TABLES \
    --table-size=$SYSBENCH_TABLE_SIZE run > "${BASE_FOLDER}/${FOLDER}/oltp_update_non_index.txt"

    # 插入
  sysbench "${SYSBENCH_TEST_PATH}/oltp_insert.lua" \
    --mysql-host=$MYSQL_HOST \
    --mysql-port=$MYSQL_PORT \
    --mysql-user=$MYSQL_USER \
    --mysql-password=$MYSQL_PASSWORD \
    --mysql-db=$MYSQL_DB \
    --db-driver=mysql \
    --time=$SYSBENCH_TEST_DURATION \
    --threads=$THREADS \
    --tables=$SYSBENCH_TABLES \
    --table-size=$SYSBENCH_TABLE_SIZE run > "${BASE_FOLDER}/${FOLDER}/oltp_insert.txt"
  # 删除
  sysbench "${SYSBENCH_TEST_PATH}/oltp_delete.lua" \
    --mysql-host=$MYSQL_HOST \
    --mysql-port=$MYSQL_PORT \
    --mysql-user=$MYSQL_USER \
    --mysql-password=$MYSQL_PASSWORD \
    --mysql-db=$MYSQL_DB \
    --db-driver=mysql \
    --time=$SYSBENCH_TEST_DURATION \
    --threads=$THREADS \
    --tables=$SYSBENCH_TABLES \
    --table-size=$SYSBENCH_TABLE_SIZE run > "${BASE_FOLDER}/${FOLDER}/oltp_delete.txt"
done