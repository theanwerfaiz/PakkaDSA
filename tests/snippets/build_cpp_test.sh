#!/bin/sh
# Syntax-checks all C++ snippets and runs a subset against known answers. Needs g++ with C++17.
set -e
cd "$(dirname "$0")"
node extract.cjs >/dev/null
cat > out/cpp_head.h << 'CEOF'
#include <bits/stdc++.h>
using namespace std;
struct ListNode { int val; ListNode* next; };
struct Node { int val; Node *left = nullptr, *right = nullptr; };
CEOF
for f in bubble selection insertion merge quick heapsort linear binary pairsum water maxsumk longestuniq kadane parens nextgreater reverselist middlelist cyclelist bstbuild bstsearch inorder preorder postorder levelorder heapinsert bfs dfs dijkstra topo fib coins lcs knap nqueens subsets hanoi; do
  { cat out/cpp_head.h; cat out/$f.cpp; echo; echo "int main(){return 0;}"; } > out/t_$f.cpp
  g++ -std=c++17 -fsyntax-only out/t_$f.cpp
done
echo "C++ syntax OK for 34 snippets (BFS/A* grid snippets use undefined helper types by design)"
cat out/cpp_head.h | sed '/struct/d' > out/run_cpp.cpp
for f in bubble selection insertion merge quick heapsort binary maxsumk longestuniq kadane coins lcs nqueens; do cat out/$f.cpp >> out/run_cpp.cpp; echo >> out/run_cpp.cpp; done
cat >> out/run_cpp.cpp << 'CEOF'
int fails=0;
#define CHK(c,m) if(!(c)){cout<<"FAIL "<<m<<"\n";fails++;}
int main(){
  vector<int> arr={38,27,43,3,9,82,10,55,3}, s=arr; sort(s.begin(),s.end());
  {auto a=arr; bubbleSort(a); CHK(a==s,"bubble");} {auto a=arr; selectionSort(a); CHK(a==s,"selection");}
  {auto a=arr; insertionSort(a); CHK(a==s,"insertion");} {auto a=arr; mergeSort(a,0,a.size()-1); CHK(a==s,"merge");}
  {auto a=arr; quickSort(a,0,a.size()-1); CHK(a==s,"quick");} {auto a=arr; heapSort(a); CHK(a==s,"heap");}
  CHK(binarySearch({3,8,15,21,27,34,42},42)==6,"binary"); CHK(maxSumK({2,1,5,1,3,2,9,1,4},3)==14,"maxsumk");
  CHK(longestUnique("abcabcbbpq")==3,"longestuniq"); CHK(maxSubarray({-2,1,-3,4,-1,2,1,-5,4})==6,"kadane");
  CHK(coinChange({1,2,5},11)==3,"coins"); CHK(lcs("ABCBDAB","BDCABA")==4,"lcs");
  {vector<int> cols(6,-1); CHK(solve(0,6,cols),"nqueens");}
  cout<<"C++ runtime checks done, failures: "<<fails<<"\n"; return fails?1:0;
}
CEOF
g++ -std=c++17 -O1 out/run_cpp.cpp -o out/run_cpp && ./out/run_cpp
