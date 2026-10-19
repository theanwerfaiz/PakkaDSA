#!/bin/sh
# Compiles every Java snippet into one class and runs it against known answers. Needs JDK 17+ (uses `java File.java`).
set -e
cd "$(dirname "$0")"
node extract.cjs >/dev/null
{ cat << 'JEOF'
import java.util.*;
public class JT {
  static class Node { int val; Node left, right; Node(int v) { val = v; } }
  static class ListNode { int val; ListNode next; ListNode(int v){val=v;} }
JEOF
for f in bubble selection insertion merge quick heapsort linear binary pairsum water maxsumk longestuniq kadane parens nextgreater reverselist middlelist cyclelist bstbuild bstsearch inorder preorder postorder levelorder heapinsert bfs dfs dijkstra topo fib coins lcs knap nqueens subsets hanoi; do sed 's/^/  /' out/$f.java; echo; done
cat << 'JEOF'
  static int fails = 0;
  static void chk(boolean c, String m) { if (!c) { System.out.println("FAIL " + m); fails++; } }
  static ListNode mk(int[] v, int cyc) { ListNode[] ns = new ListNode[v.length]; for (int i = 0; i < v.length; i++) ns[i] = new ListNode(v[i]);
    for (int i = 0; i < v.length - 1; i++) ns[i].next = ns[i + 1]; if (cyc >= 0) ns[v.length - 1].next = ns[cyc]; return ns[0]; }
  @SuppressWarnings("unchecked")
  public static void main(String[] x) {
    int[] arr = {38,27,43,3,9,82,10,55,3}; int[] s = arr.clone(); Arrays.sort(s); int[] a;
    a = arr.clone(); bubbleSort(a); chk(Arrays.equals(a, s), "bubble");
    a = arr.clone(); selectionSort(a); chk(Arrays.equals(a, s), "selection");
    a = arr.clone(); insertionSort(a); chk(Arrays.equals(a, s), "insertion");
    a = arr.clone(); mergeSort(a, 0, a.length - 1); chk(Arrays.equals(a, s), "merge");
    a = arr.clone(); quickSort(a, 0, a.length - 1); chk(Arrays.equals(a, s), "quick");
    a = arr.clone(); heapSort(a); chk(Arrays.equals(a, s), "heap");
    chk(linearSearch(new int[]{4,8,15}, 15) == 2, "linear");
    chk(binarySearch(new int[]{3,8,15,21,27,34,42}, 42) == 6, "binary");
    chk(Arrays.equals(pairSum(new int[]{2,4,7,11,15,18,21}, 22), new int[]{1,5}), "pairsum");
    chk(maxWater(new int[]{1,8,6,2,5,4,8,3,7}) == 49, "water");
    chk(maxSumK(new int[]{2,1,5,1,3,2,9,1,4}, 3) == 14, "maxsumk");
    chk(longestUnique("abcabcbbpq") == 3, "longestuniq");
    chk(maxSubarray(new int[]{-2,1,-3,4,-1,2,1,-5,4}) == 6, "kadane");
    chk(isValid("{[()()]}") && !isValid("([)]") && !isValid("{[}"), "parens");
    chk(Arrays.equals(nextGreater(new int[]{4,5,2,25,7,8,1}), new int[]{5,25,25,-1,8,-1,-1}), "nextgreater");
    ListNode h = reverse(mk(new int[]{1,2,3,4,5}, -1)); chk(h.val == 5 && h.next.val == 4, "reverse");
    chk(middle(mk(new int[]{1,2,3,4,5,6,7}, -1)).val == 4 && middle(mk(new int[]{1,2,3,4,5,6}, -1)).val == 4, "middle");
    chk(hasCycle(mk(new int[]{3,7,1,9}, 1)) && !hasCycle(mk(new int[]{3,7,1,9}, -1)), "cycle");
    Node root = null; for (int v : new int[]{50,30,70,20,40,60,80}) root = insert(root, v);
    chk(search(root, 60).val == 60, "bstsearch");
    List<Integer> o = new ArrayList<>(); inorder(root, o); chk(o.toString().equals("[20, 30, 40, 50, 60, 70, 80]"), "inorder");
    o = new ArrayList<>(); preorder(root, o); chk(o.toString().equals("[50, 30, 20, 40, 70, 60, 80]"), "preorder");
    o = new ArrayList<>(); postorder(root, o); chk(o.toString().equals("[20, 40, 30, 60, 80, 70, 50]"), "postorder");
    chk(levelOrder(root).toString().equals("[50, 30, 70, 20, 40, 60, 80]"), "levelorder");
    List<Integer> hp = new ArrayList<>(); for (int v : new int[]{9,4,7,1,8,2,6}) heapPush(hp, v); chk(hp.get(0) == 1, "heap");
    List<Integer>[] g = new List[4]; for (int i = 0; i < 4; i++) g[i] = new ArrayList<>();
    g[0].addAll(List.of(1, 2)); g[1].add(3); g[2].add(3);
    chk(bfs(g, 0).toString().equals("[0, 1, 2, 3]"), "bfs");
    List<Integer> ord = new ArrayList<>(); dfs(g, 0, new boolean[4], ord); chk(ord.toString().equals("[0, 1, 3, 2]"), "dfs");
    chk(topoSort(g).toString().equals("[0, 1, 2, 3]"), "topo");
    List<int[]>[] wg = new List[4]; for (int i = 0; i < 4; i++) wg[i] = new ArrayList<>();
    wg[0].add(new int[]{1,4}); wg[0].add(new int[]{2,1}); wg[1].add(new int[]{3,1}); wg[2].add(new int[]{1,2}); wg[2].add(new int[]{3,5});
    chk(Arrays.equals(dijkstra(wg, 0), new int[]{0,3,1,4}), "dijkstra");
    chk(fib(10) == 55, "fib"); chk(coinChange(new int[]{1,2,5}, 11) == 3, "coins");
    chk(lcs("ABCBDAB", "BDCABA") == 4, "lcs");
    chk(knapsack(new int[]{1,3,4,5}, new int[]{1,4,5,7}, 7) == 9, "knap");
    chk(solve(0, 6, new int[]{-1,-1,-1,-1,-1,-1}), "nqueens");
    List<List<Integer>> out = new ArrayList<>(); go(new int[]{1,2,3}, 0, new ArrayList<>(), out); chk(out.size() == 8, "subsets");
    hanoi(1, 'A', 'C', 'B');
    System.out.println("Java checks done, failures: " + fails);
    if (fails > 0) System.exit(1);
  }
}
JEOF
} > out/JT.java
java out/JT.java 2>&1 | grep -v "^Note:"
