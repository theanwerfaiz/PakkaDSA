import sys, os
HERE=os.path.dirname(os.path.abspath(__file__))
from collections import deque
import heapq
def L(i): return open(os.path.join(HERE,'out',f'{i}.py')).read()
def ld(ids):
    ns={'deque':deque,'heapq':heapq}
    for i in ids: exec(L(i),ns)
    return ns
bad=0
def eq(a,b,m):
    global bad
    if a!=b: print('FAIL',m,a,b); bad+=1
arr=[38,27,43,3,9,82,10,55,3]; s=sorted(arr)
for i,fn in [('bubble','bubble_sort'),('selection','selection_sort'),('insertion','insertion_sort'),('merge','merge_sort'),('quick','quick_sort'),('heapsort','heap_sort')]:
    a=list(arr); ld([i])[fn](a); eq(a,s,i)
eq(ld(['linear'])['linear_search']([4,8,15],15),2,'linear')
eq(ld(['binary'])['binary_search']([3,8,15,21,27,34,42],42),6,'binary')
eq(ld(['pairsum'])['pair_sum']([2,4,7,11,15,18,21],22),(1,5),'pairsum')
eq(ld(['water'])['max_water']([1,8,6,2,5,4,8,3,7]),49,'water')
eq(ld(['maxsumk'])['max_sum_k']([2,1,5,1,3,2,9,1,4],3),14,'maxsumk')
eq(ld(['longestuniq'])['longest_unique']('abcabcbbpq'),3,'longestuniq')
eq(ld(['kadane'])['max_subarray']([-2,1,-3,4,-1,2,1,-5,4]),6,'kadane')
pv=ld(['parens'])['is_valid']; eq([pv('{[()()]}'),pv('([)]'),pv('{[}')],[True,False,False],'parens')
eq(ld(['nextgreater'])['next_greater']([4,5,2,25,7,8,1]),[5,25,25,-1,8,-1,-1],'nextgreater')
class N:
    def __init__(s,v): s.val=v; s.next=None; s.left=None; s.right=None
def R(vals,cyc=-1):
    ns=[N(v) for v in vals]
    for i in range(len(ns)-1): ns[i].next=ns[i+1]
    if cyc>=0: ns[-1].next=ns[cyc]
    return ns[0]
def inject(ns): ns['Node']=N; return ns
h=ld(['reverselist'])['reverse'](R([1,2,3,4,5])); o=[]
while h: o.append(h.val); h=h.next
eq(o,[5,4,3,2,1],'reverse')
mid=ld(['middlelist'])['middle']; eq([mid(R([1,2,3,4,5,6,7])).val,mid(R([1,2,3,4,5,6])).val],[4,4],'middle')
hc=ld(['cyclelist'])['has_cycle']; eq([hc(R([3,7,1,9],1)),hc(R([3,7,1,9]))],[True,False],'cycle')
ns=ld(['bstbuild']); ns['Node']=N; root=None
for v in [50,30,70,20,40,60,80]: root=ns['insert'](root,v)
eq(ld(['bstsearch'])['search'](root,60).val,60,'bstsearch')
def run(i,fn):
    out=[]; ld([i])[fn](root,out); return out
eq(run('inorder','inorder'),[20,30,40,50,60,70,80],'inorder'); eq(run('preorder','preorder'),[50,30,20,40,70,60,80],'preorder'); eq(run('postorder','postorder'),[20,40,30,60,80,70,50],'postorder')
eq(ld(['levelorder'])['level_order'](root),[50,30,70,20,40,60,80],'levelorder')
hp=[]; f=ld(['heapinsert'])['heap_push']
for v in [9,4,7,1,8,2,6]: f(hp,v)
eq(hp[0],1,'heap')
g={0:[1,2],1:[3],2:[3],3:[]}
eq(ld(['bfs'])['bfs'](g,0),[0,1,2,3],'bfs')
seen=set(); order=[]; ld(['dfs'])['dfs'](g,0,seen,order); eq(order,[0,1,3,2],'dfs')
eq(ld(['topo'])['topo_sort'](g),[0,1,2,3],'topo')
eq(ld(['dijkstra'])['dijkstra']({0:[(1,4),(2,1)],1:[(3,1)],2:[(1,2),(3,5)],3:[]},0),{0:0,1:3,2:1,3:4},'dijkstra')
eq(ld(['fib'])['fib'](10),55,'fib'); eq(ld(['coins'])['coin_change']([1,2,5],11),3,'coins')
eq(ld(['lcs'])['lcs']('ABCBDAB','BDCABA'),4,'lcs')
eq(ld(['knap'])['knapsack']([(1,1),(3,4),(4,5),(5,7)],7),9,'knap')
cols=[-1]*6; eq(ld(['nqueens'])['solve'](0,6,cols),True,'nqueens')
eq(len(ld(['subsets'])['subsets']([1,2,3])),8,'subsets')
ld(['hanoi'])['hanoi'](2,'A','C','B')
for i in ['gridbfs','astar']: compile(L(i),i,'exec')
print('Python checks done, failures:',bad)
sys.exit(1 if bad else 0)
