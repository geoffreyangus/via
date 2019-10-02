import os
import json

import seaborn as sns
import numpy as np
from matplotlib import pyplot as plt
from matplotlib.gridspec import GridSpec
from scipy.stats import zscore
import pandas as pd
from collections import defaultdict
import fnmatch

from via.util.util import get_prefix

def plot_persistence():
    departments = ['bio', 'chem', 'math']
    experiment_dir = 'experiments/final/persistence'

    f, axarr = plt.subplots(1, len(departments), sharey=True)
    f.set_figwidth(15)
    f.set_figheight(3.5)
    for i, department in enumerate(departments):
        with open(os.path.join(experiment_dir, 'metrics', f'metrics-{department}.json')) as f:
            d = json.load(f)

        nodes = d['stopgap_nodes'][:10]
        x = [val[0] for val in nodes]
        y = np.array([val[1] for val in nodes])
        mu = np.mean(y)
        std = np.std(y)

        sns.barplot(x, y, color="#99CCFF", ax=axarr[i], zorder=5)
        axarr[i].set_title(f'{get_prefix(x[0])} department')
        if i == 0:
            axarr[i].set_ylabel('Subsequent enrollments')
        if i == 1:
            axarr[i].set_xlabel('Current course')
        axarr[i].set_xticklabels(axarr[i].get_xticklabels(), rotation=45,
                           size='small', ha='right')
        axarr[i].yaxis.grid(True, color='#DDDDDD', zorder=-1, linestyle=':')
    plt.tight_layout()
    # plt.savefig('figures/figures_pdf/persistence.pdf')
    plt.show()

def plot_roles():
    features = [
        'in_degree',
        'out_degree',
        'betweenness',
        'closeness',
        'closeness_rev',
        'pagerank'
    ]
    experiment_dir = 'experiments/final/rolx'
    with open(os.path.join(experiment_dir, 'rolx_sense.json')) as f:
        d = json.load(f)

    res = dict()
    res[f'Role {int(0)+1}'] = d['1'][0]
    res[f'Role {int(1)+1}'] = d['0'][0]
    res[f'Role {int(2)+1}'] = d['2'][0]

    res[f'metric'] = features

    df = pd.DataFrame.from_dict(res)
    df = pd.melt(df, id_vars="metric", var_name="class")

    f, ax = plt.subplots(1, 1)
    f.set_figwidth(7)
    sns.factorplot(x='metric', y='value', palette=['#FF6666', '#6699FF', '#99FF66'],
                   hue='class', data=df, kind='bar', ax=ax)
    ax.set_title('NodeSense')
    ax.set_xlabel('Measurements')
    ax.set_ylabel('Contribution of Role')
    plt.close(2)
    # plt.savefig('figures/figures_pdf/rolx_sense.pdf')
    plt.show()

def plot_inbound_departments():
    years = [2000, 2004, 2008, 2012, 2016]

    inbound_departments = {}
    for i in range(1, len(years)):
        dirname = f'{years[i-1]}-{years[i]}'
        metrics_path = os.path.join(
            f'experiments/final/CS106A', dirname, 'metrics/metrics.json')
        with open(metrics_path, 'r') as f:
            d = json.load(f)
            departments = d['node_department_out_degree']['CS106A']
            inbound_departments[years[i-1]] = {
                department: value for department, value in departments
            }
    df = pd.DataFrame.from_dict(inbound_departments)
    df = df.fillna(0.0)
    df = df.loc[(df[2000] > 0) | (df[2004] > 0) | (df[2008] > 0) | (df[2012] > 0)]
    df = pd.melt(df.reset_index(), id_vars='index', value_vars=years[:-1])
    sns.lineplot(data=df, x='variable', y='value', hue='index')
    plt.show()

def plot_pagerank_by_department():
    k = 9
    years =  ['2010-2018'] # ['2000-2008', '2005-2013', '2010-2018']
    experiments = ['experiments/final/pagerank_ug_counts'] # 'experiments/final/pagerank_ba_counts']
    comparison_type = 'pagerank.json'

    plt.figure(figsize=(15, 10))
    the_grid = GridSpec(len(experiments), len(years))
    the_grid.update(wspace=0.025, hspace=0.05)
    for i, experiment_dir in enumerate(experiments):
        for j, year in enumerate(years):
            plt.subplot(the_grid[i, j], aspect=1)
            with open(os.path.join(experiment_dir, year, comparison_type), 'r') as f:
                d = json.load(f)

            departments = defaultdict(float)
            for entry, pagerank in d.items():
                is_lang = fnmatch.filter(entry, '*LANG*') or fnmatch.filter(entry, '*LNG*')
                if is_lang:
                    prefix = 'LANG'
                else:
                    prefix = get_prefix(entry)
                departments[prefix] += pagerank

            departments = sorted(departments.items(), key=lambda x: x[1], reverse=True)
            top_k = departments[:k]
            other = [('OTHER', sum([pagerank for department, pagerank in departments[k:]]))]

            groups = (top_k + other)
            labels, values = zip(*groups)
            print(sum(d.values()))
            values = np.array(values) * 10

            my_circle = plt.Circle((0, 0), 0.4, color='white')
            plt.pie(values, labels=labels, colors=sns.light_palette(
                '#99CCFF' if i == 0 else '#FC0E1C', n_colors=k+1, reverse=True),
                wedgeprops={"edgecolor": "white", 'linewidth': 3, 'antialiased': True},
                textprops={'fontsize': 10})
            p = plt.gcf()
            p.gca().add_artist(my_circle)
            if i == 0:
                plt.title(year)

    # plt.savefig('figures/figures_pdf/2010-2018-pr.pdf')
    plt.show()