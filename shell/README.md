linux shell scripts. 

## performance tests 
### install sysbench 
```sh
curl -s https://packagecloud.io/install/repositories/akopytov/sysbench/script.rpm.sh | sudo bash
sudo yum -y install sysbench
```
### run test_script

```sh 
# 1. change your mysql password to this shell_script
# your_password exist in file_ , newpwd is the replace word
sed -i 's/your_password/newpwd/g' file1 file2 file3

# default test for 1,4,8,16 thread for readonly, writeonly ,read_write, update_index, update_non_idex
sh run_sysbench_tests.sh
# run all env for x threads
sh run_sysbench_tests_thread.sh
```