import os
import logging
import json
from collections import Counter, defaultdict

from scipy.stats import zscore
import numpy as np
import networkx as nx
from networkx.algorithms.community.quality import modularity as nx_modularity
from networkx.algorithms.cluster import clustering

from via.util.util import get_prefix, get_networkx_graph


def highest_out_degree(self, g, course_ids, k=20):
    res = {}
    for course_id in course_ids:
        assert course_id in g.nodes, 'node must exist in graph'
        course_res = []
        for nbr in g.successors(course_id):
            course_res.append([nbr, g[course_id][nbr]['weight']])
        res[course_id] = sorted(
            course_res, key=lambda x: x[1], reverse=True
        )[:k]
    return res

def betweenness_centrality(self, g, k=20):
    res = nx.betweenness_centrality(g, weight='weight').items()
    res = sorted(
        res, key=lambda x: x[1], reverse=True
    )[:k]
    return res

def node_department_in_degree(self, g, course_ids=[], k=20):
    res = {}
    for course_id in course_ids:
        assert course_id in g.nodes, 'node must exist in graph'
        in_nbrs = g.predecessors(course_id)
        edge_data = [((i, course_id), g.get_edge_data(i, course_id)['weight'])
                    for i in in_nbrs]
        # print([edge for edge in edge_data if get_prefix(edge[0][0]) == 'GS'])
        avg_weight = get_avg_degree_by_department(
            edge_data, nbr_direction='in')
        # print(avg_weight['GS'])
        course_res = avg_weight.items()
        res[course_id] = sorted(
            course_res, key=lambda x: x[1], reverse=True
        )[:k]
    return res

def node_department_out_degree(self, g, course_ids=[], k=20):
    res = {}
    for course_id in course_ids:
        assert course_id in g.nodes, 'node must exist in graph'
        out_nbrs = g.successors(course_id)
        avg_weight = get_avg_degree_by_department(g, nbr_direction='out')
        course_res = avg_weight.items()
        res[course_id] = sorted(
            course_res, key=lambda x: x[1], reverse=True
        )[:k]
    return res

def get_avg_degree_by_department(self, g, nbr_direction='in'):
    '''Given a set of edges, calculate the average weight by department.

    This assumes that there is some particular node of interest and that
    these are neighbors of a 'target' node. See usage of function in
    node_department_out_degree and node_department_in_degree for details.

    params:
    - edge_data (edge (tuple), weight (float))  describes edge interaction
    - nbr_direction (string)    target node relationship with neighbor
    '''
    edge_data = [((course_id, i), g.get_edge_data(course_id, i)['weight'])
                 for i in out_nbrs]
    sum_count = defaultdict(int)
    sum_weight = defaultdict(float)
    for edge, weight in edge_data:
        if nbr_direction == 'in':
            nbr_department = get_prefix(edge[0]) # neighbor -> target
        elif nbr_direction == 'out':
            nbr_department = get_prefix(edge[1])
        sum_count[nbr_department] += 1
        sum_weight[nbr_department] += weight

    avg_weight = {}
    for department in sum_count.keys():
        avg_weight[department] = sum_weight[department] / \
            sum_count[department]
    return avg_weight

def stopgap_nodes(self, g, department='', k=20):
    department_node_ids = [
        node for node in g.nodes if department == get_prefix(node)
    ]

    res = []
    for node_id in department_node_ids:
        print(node_id)
        # out degree leading into the department
        out_degree_internal = sum(
            [
                i[2] for i in nx.edge_boundary(g, [node_id], department_node_ids, data='weight')
            ]
        )
        sample_edges = [edge for edge in g.edges if edge[1] == node_id]
        if len(sample_edges) == 0:
            continue
        sample_edge = sample_edges[0]
        count = g.get_edge_data(sample_edge[0], sample_edge[1])[
            'count_course']

        if out_degree_internal == 0:
            out_degree_internal = 1
        print(f"{int(out_degree_internal)} total {department} courses enrolled by {int(count)} students after course {node_id}")
        coeff = out_degree_internal / count
        res.append((node_id, coeff))

    res = sorted(
        res, key=lambda x: x[1], reverse=True
    )[:k]
    return res

def target_out_degree(self, g, src_department='', dst_department='', k=20):
    # all edges that leave src_department but do not enter dst_department
    ext_edges = {
        edge: g.get_edge_data(edge[0], edge[1]) for edge in g.edges
        if src_department in edge[0] and dst_department not in edge[1]
    }

    src_nodes = [node for node in g.nodes if src_department in node]
    out = g.out_degree(src_nodes)
    out_weighted = g.out_degree(src_nodes, weight='weight')

    res = []
    for node_id in src_nodes:

        ext_data = {
            edge: attrs for edge, attrs in ext_edges.items()
            if edge[0] == node_id
        }
        ext_degree = len(ext_data.keys())
        ext_weight = sum([attrs['weight'] for attrs in ext_data.values()])
        sample_edge = [
            edge for edge in g.edges if edge[0] == node_id
        ]

        if len(sample_edge) != 0:
            node_p = g.get_edge_data(
                sample_edge[0][0], sample_edge[0][1]
            )['p_prereq']
        else:
            sample_edge = [
                edge for edge in g.edges if edge[1] == node_id
            ]
            node_p = g.get_edge_data(
                sample_edge[0][0], sample_edge[0][1]
            )['p_course']

        if (out[node_id] - ext_degree == 0):
            continue

        avg_degree = (out_weighted[node_id] - ext_weight) / \
            (out[node_id] - ext_degree)

        res.append((node_id, avg_degree, node_p))
    res = sorted(
        res, key=lambda x: x[1], reverse=True
    )[:k]
    return res

def num_courses(self, g, k=20):
    res = Counter([get_prefix(course) for course in g.nodes])
    res = sorted(
        list(num_courses.items()), key=lambda x: x[1], reverse=True
    )[:k]
    return res

def modularity(self, g, department_clusters=None, use_undirected=False, k=20):
    if use_undirected:
        g = g.to_undirected()
    else:
        g = g

    if not department_clusters:
        department_clusters = extract_departments(g)

    res = []
    for department, cluster in department_clusters.items():
        g2 = {i for i in g.nodes if i not in cluster}
        res.append((department, nx_modularity(g, [cluster, g2])))

    res = sorted(
        res, key=lambda x: x[1], reverse=True
    )[:k]
    return res

def clustering_coefficient(self, g, department_clusters=None, use_undirected=False, k=20):
    if use_undirected:
        g = g.to_undirected()
    else:
        g = g

    if not department_clusters:
        department_clusters = extract_departments(g)

    res = []
    for department, cluster in department_clusters.items():
        cfs  = clustering(g, cluster)
        res.append((department, sum(cfs.values()) / len(cfs)))

    res = sorted(
        res, key=lambda x: x[1], reverse=True
    )[:k]
    return res

def department_out_degree(self, g, department_clusters=None, use_undirected=False, k=20):
    if use_undirected:
        g = g.to_undirected()
    else:
        g = g

    if not department_clusters:
        department_clusters = extract_departments(g)

    res = []
    for department, cluster in department_clusters.items():
        nodes = sorted(list(cluster))
        for node in nodes[1:]:
            g = nx.contracted_nodes(g, nodes[0], node, self_loops=False)
        res.append((department, g.out_degree(nodes[0], weight='score')))

    res = sorted(
        res, key=lambda x: x[1], reverse=True
    )[:k]

def department_in_degree(self, g, department_clusters=None, use_undirected=False, k=20):
    if use_undirected:
        g = g.to_undirected()
    else:
        g = g

    if not department_clusters:
        department_clusters = extract_departments(g)

    res = []
    for department, cluster in department_clusters.items():
        nodes = sorted(list(cluster))
        for node in nodes[1:]:
            g = nx.contracted_nodes(g, nodes[0], node, self_loops=False)
        res.append((department, g.in_degree(nodes[0], weight='score')))

    res = sorted(
        res, key=lambda x: x[1], reverse=True
    )[:k]

def department_internal_edges(self, g, department_clusters=None, use_undirected=False, k=20):
    if use_undirected:
        g = g.to_undirected()
    else:
        g = g

    if not department_clusters:
        department_clusters = extract_departments(g)

    res = []
    for department, cluster in department_clusters.items():
        nodes = sorted(list(cluster))
        for node in nodes[1:]:
            g = nx.contracted_nodes(g, nodes[0], node, self_loops=True)
        res.append((department, g.number_of_edges(nodes[0], nodes[0])))

    res = sorted(
        res, key=lambda x: x[1], reverse=True
    )[:k]

def subgraph_motifs(self, use_undirected=False):
    print("subgraph_motifs not implemented. Skipping.")

def extract_departments(self, g):
    department_clusters = {}
    prefixes = {get_prefix(course) for course in g.nodes}
    for prefix in prefixes:
        cluster = {
            course for course in g.nodes
            if get_prefix(course) == prefix
        }
        department_clusters[prefix] = cluster
    return department_clusters
