# Via

Via is a network analysis toolkit for the visualization of academic pathways in university enrollment data.

## Project Status

This project is under active development through the Carta Lab at Stanford. Please contact Geoffrey Angus (gangus@stanford.edu) for details.

## Motivation

The processes through which course selections accumulate into college pathways in US higher education is poorly instrumented for observation at scale. We offer an analytic toolkit, called Via, which transforms commonly available enrollment data into formal graphs that are amenable to interactive visualizations and computational exploration. From enrollment data, we construct a unimodal graph with courses as nodes and student paths as weighted edges, which can then be analyzed through tools such as [PageRank](http://ilpubs.stanford.edu:8090/422/1/1999-66.pdf) and [RolX](https://research.google.com/pubs/archive/46591.pdf).

## Installation

```
git clone https://github.com/geoffreyangus/via.git
cd via

python3 -m virtualenv env
source env/bin/activate

pip install -e .
```

## References

Original paper: [Via: Illuminating Academic Pathways at Scale](http://delivery.acm.org/10.1145/3340000/3333623/a23-Angus.pdf?ip=171.66.12.89&id=3333623&acc=OPENTOC&key=AA86BE8B6928DDC7%2E0AF80552DEC4BA76%2E4D4702B0C3E38B35%2E9F04A3A78F7D3B8D&__acm__=1570032194_3ab70b5b05d250f7d33837aafe1beb71)

## Quickstart

#### 1.) Input

In order to get started with the repository, we need to have the raw enrollment data on hand as a CSV file. The toolkit processes the data as individual enrollment entries, thus it requires the following column types:

| student_id | course_id | quarter_id | quarter_name | dropped | curr_major | final_major |
|------------|-----------|------------|--------------|---------|------------|-------------|
|            |           |            |              |         |            |             |
|            |           |            |              |         |            |             |
|            |           |            |              |         |            |             |

- student_id: the unique hash identifier of each student
- course_id: the unique course code (commonly doubles as the course listing, e.g. CS101)
- quarter_id: the unique numerical identifier for a given timeframe 
- quarter_name: the human readable name corresponding to a given quarter_id
- dropped: whether the student dropped the course at some point after enrollment
- curr_major: the students major at time of enrollment
- final_major: the students major upon degree completion

#### 2.) Input Preprocessing

Once we have the raw enrollment data, you must create a folder within the `data` directory containing a `params.json` file, referred to below as `<DATA_DIR`>. This repository is built for research and emphasizes reproducibility, thus we package all parameters used to generate output in the same folder as the output itself. An example `params.json` file can be found in `data/sample`. Once we have a directory set up, run the following line of code:

```
$ build_dataset <DATA_DIR>
````

A Numpy matrix will be saved as `<DATA_DIR>/sequences.npy` (caution: this file can be quite large, often between 1-5GB). This is an adjacency matrix mapping students to their respective course enrollments. We can now use this matrix to create graph projections for visualization.

Note: We leverage the `click` package to build our CLI. The `build_dataset` command is defined in `run.py`.

#### 3.) Graph Projection

Given a `sequences.npy` file, we can create a graph projection for visualization. Like before, create a folder within the `experiments` directory containing a `params.json` file, referred to below as `<EXPERIMENT_DIR`>. An example `params.json` file can be found in `experiments/sample`. Once this is complete, run the following line of code:

```
$ build_projection <EXPERIMENT_DIR>
```

An edgelist containing all node interactions will be saved as `<EXPERIMENT_DIR>/projection.txt`. At this point, we can use [Cytoscape](https://cytoscape.org/) to ingest this file and create visualizations.

#### 4.) Edgelist Enrichment

If we are interested in more elaborate Cytoscape figures, we can choose to encode further information into the edgelists. Run the following command in an experiment directory containing an existing `projection.txt` file

```
$ enrich_projection <EXPERIMENT_DIR>
```

This will output a new edgelist with additional information usable as node/edge attributes from within Cytoscape.

#### 5.) Additional Commands

If we are interested in some of the more computational experiments, there are two additional CLI commands:

```
$ run_louvain <EXPERIMENT_DIR>
```

and

```
$ run_rolx <EXPERIMENT_DIR>
```

which will each output additional analyses into `<EXPERIMENT_DIR>`.

#### 6.) Additional Metrics and Visualizations (Optional)

There are some operations that are best suited for Jupyter notebook exploration; specifically, matplotlib-type visualizations and other network analysis (e.g. computing centrality, PageRank score, etc.). We define functions for these operations in `analysis/metrics.py` and `analysis/visualization.py`. Note: since the refactor, _these have not been tested thoroughly_. The core implementation is unchanged, but there may be lingering compiler errors. In order to set up a Jupyter notebook for analysis, create a Jupyter notebook in `notebooks/` and be sure to place these commands in the first cell:

```
%load_ext autoreload
%autoreload 2

import os
os.chdir(<ABSOLUTE_PATH>)
```

Where `<ABSOLUTE_PATH>`is the path to the via repository for your local machine. This will allow you to run code with relative paths across the entire repository. See `notebooks/sample.ipynb` for details.
