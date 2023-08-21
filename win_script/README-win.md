# About
Some script that i used in windows to be performance.
## Barrier:
- `re-barrier.cmd` : restart barrier.exe (barrier.exe must run before) 
  - hint: barrier works as server cause it run as service. you need keep barrier service running first. 
  ```sh
  # in #{os} work as server 
  # windows 
    net start barrier
  # linux 
    service restart barrier 
  ```
