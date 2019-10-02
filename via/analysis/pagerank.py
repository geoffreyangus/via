import networkx as nx
from tqdm import tqdm

from via.util.util import get_networkx_graph

def run_randomwalk(g, given_courses=[], num_iters=1000,
                   num_quarters=3, courses_per_quarter=3, course_pool_choices=20):
    """
    Runs random walk to simulate students taking courses.
    """
    course_ids = given_courses
    course_ids = [node for node in g.nodes() if node in course_ids]
    ppr = {node: 1 if node in course_ids else 0.0 for node in g.nodes()}

    hist = Counter()
    for i in range(num_iters):
        if i % 100 == 0:
            print(i)
        student_result = list()
        for timesteps in range(num_quarters + 1):
            # Start at <BEGIN> node every time
            if timesteps == 0:
                student_result = ['<BEGIN>']
            ppr = {node: 1.0 if node in student_result else 0.0 for node in g.nodes()}
            total = sum(ppr.values())
            for cid, score in ppr.items():
                ppr[cid] /= total

            course_pool = []
            for course_id in course_ids:
                course_pool += [
                    (g[course_id][nbr]['weight'], nbr)
                    for nbr in g.successors(course_id) if nbr not in course_ids and nbr not in {'<END>'}
                ]
            # page_rank = nx.pagerank(g, alpha=1.0, personalization=ppr, weight='weight')
            # course_pool = [(page_rank[node], node)
            #             for node in g.nodes() if node not in course_ids]
            # Choose from
            if len(course_pool) < courses_per_quarter:
                course_pool += random.sample(g.successors('<BEGIN>'),
                                             len(course_id) - courses_per_quarter)
            probs, pool = zip(*sorted(course_pool, reverse=True)[:course_pool_choices])
            probs = np.array(probs)
            probs /= np.sum(probs)
            sample_idxs = np.random.choice(range(len(pool)), min(courses_per_quarter, len(course_pool)), replace=False, p=probs).tolist()
            course_ids = [course for i, course in enumerate(pool) if i in sample_idxs]
            student_result += course_ids
            print(student_result)
        hist += Counter(student_result)
    return hist

def run_pagerank_recommender(g, target_course, given_courses={}):
    """
    Finds the course that leads to the highest pagerank for target_course.

    We can seed the recommendation with given_courses. If given_courses is a
    list, all values get an equal ppr weight . If given_courses is a dict, we
    use the weights provided.

    Returns:
        max_node    the node that led to the highest pagerank for the target
        target_pagerank the resulting pagerank for target_course
    """
    if type(given_courses) == list:
        ppr = {course: 1 for course in given_courses}
    elif type(given_courses) == dict:
        ppr = given_courses
    else:
        ppr = None
    assert len(set(ppr.keys()) & set(g.nodes)) > 0, "ppr must have nodes in g"

    max_node = None
    max_pr = -1
    for node in tqdm(g.nodes):
        if node in ppr or node == target_course:
            continue
        ppr[node] = 1

        d = nx.pagerank(g, personalization=ppr, weight='weight')
        # d_list = sorted(d.items(), key=lambda x: x[1], reverse=True)
        # classes, pr = list(zip(*d_list))

        target_pr = d[target_course]
        if target_pr > max_pr:
            max_pr = target_pr
            max_node = node

        del ppr[node]

    return {
        'max_node': max_node,
        'target_pagerank': d[target_course]
    }