import os

import click
import networkx as nx
import community
import json
import numpy as np
from collections import Counter
import random

from via.data.builder import DatasetBuilder
from via.experiment.experiment import Experiment
from via.analysis.rolx import extract_rolx_roles
from via.util.util import enrich_projection_txt, get_networkx_graph

@click.command()
@click.argument('params_dir')
def build_dataset(params_dir):
    with open(os.path.join(params_dir, 'params.json'), 'r') as f:
        params_args = json.load(f)
    process = DatasetBuilder(params_dir, **params_args)
    process.run()


@click.command()
@click.argument('params_dir')
def build_projection(params_dir):
    with open(os.path.join(params_dir, 'params.json'), 'r') as f:
        params_args = json.load(f)
    process = Experiment(params_dir, **params_args)
    process.run()


@click.command()
@click.argument('experiment_dir')
def enrich_projection(experiment_dir):
    enrich_projection_txt(experiment_dir)


@click.command()
@click.argument('experiment_dir')
def run_rolx(experiment_dir):
    G = get_networkx_graph(experiment_dir)

    idx_to_id = sorted(G.nodes())
    G = nx.convert_node_labels_to_integers(G, ordering='sorted')
    H, K = extract_rolx_roles(G, roles=3)
    num_roles, num_features = K.shape

    roles = {}
    for node in G.nodes:
        roles[idx_to_id[node]] = H[node].tolist()
    with open(os.path.join(experiment_dir, 'rolx.json'), 'w') as outfile:
        json.dump(roles, outfile, indent=4)

    sense = {}
    for i in range(num_roles):
        sense[i] = K[i].tolist()
    with open(os.path.join(experiment_dir, 'rolx_sense.json'), 'w') as outfile:
        json.dump(sense, outfile, indent=4)


@click.command()
@click.argument('experiment_dir')
def run_louvain(experiment_dir):
    g = get_networkx_graph(experiment_dir)
    g = g.to_undirected()

    d = community.generate_dendrogram(g)
    level_0 = community.partition_at_level(d, 0)

    majors = []
    for i in range(max(level_0.values())):
        major = []
        for class_id, partition_num in level_0.items():
            if partition_num == i:
                major.append(class_id)
        majors.append(major)

    with open(os.path.join(experiment_dir, 'louvain.json'), 'w') as outfile:
        json.dump(majors, outfile, indent=4)