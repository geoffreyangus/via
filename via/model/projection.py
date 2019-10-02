import numpy as np
import networkx as nx

class ProjectionModel:
    """
    """
    def build_projection(self, sequence_matrix, k):
        raise NotImplementedError

    @staticmethod
    def get_top_k_edges(A, index_to_course, k):
        assert A.any(), 'Adjacency matrix not initialized.'
        A_copy = np.array(A, copy=True)
        scores = []

        course_to_index = {course: index for index, course in enumerate(index_to_course)}
        i = 0
        while i < k:
            prev_id, curr_id = np.unravel_index(
                np.argmax(A_copy), A_copy.shape
            )
            score = A_copy[prev_id][curr_id]
            scores.append([index_to_course[prev_id], index_to_course[curr_id], score])
            if i % 1000 == 0:
                print(f"{i} edges selected. Current score is {score}")
            # Set class score to 0 to avoid interference in subsequent iterations
            A_copy[prev_id][curr_id] = 0.0
            i += 1
        return sorted(scores, key=lambda x: x[2], reverse=True)
