import os
import json
import logging

import pandas as pd
import numpy as np
from tqdm import tqdm

from via.util.util import ParamsOperation

class DatasetBuilder(ParamsOperation):
    """
    Given a directory containing a params.json file, generate a sequence matrix.
    """
    def __init__(self, params_dir, pathways_path="data/raw/raw_pathways.csv",
                 attr_filters={}, time_filters={}):
        super().__init__(params_dir)
        self.pathways_path = pathways_path
        self.attr_filters = attr_filters

    def run(self):
        """
        Initializes adjacency matrix sequences.npy.

        Additionally saves json file mapping course titles to matrix indices.
        """
        logging.info("Reading pathways CSV...")
        sequence_matrix, course_to_index = self._build_dataset()
        seqs_path = os.path.join(self.dir, 'sequences.npy')
        np.save(seqs_path, sequence_matrix)

        dict_path = os.path.join(self.dir, "course_indices.json")
        with open(dict_path, 'w') as f:
            json.dump(course_to_index, f, indent=4)

    def _build_dataset(self):
        df = self._read_pathways()

        if self.attr_filters:
            logging.info('Applying attribute filters...')
            df = self._apply_attr_filters(df)

        student_list = df['student_id'].unique()
        course_list = sorted(
            ['<BEGIN>'] + list(df['course_id'].unique()) + ['<END>']
        )
        course_to_index = {j: i for i, j in enumerate(course_list)}

        num_students = len(student_list)
        logging.info(f'Number of students:\t{num_students}')

        num_courses = len(course_list)
        logging.info(f'Number of courses:\t{num_courses}')

        sequence_matrix = np.zeros((num_students, num_courses))
        student_counter = 0
        df_grouped = df.groupby('student_id')
        for name, group in tqdm(df_grouped):
            courses_unique = group.drop_duplicates(subset=['course_id', 'dropped'])
            courses_completed = courses_unique.loc[courses_unique['dropped'] == 0]
            courses_completed = courses_completed.sort_values('quarter_id')

            # Timestep intialized at 1
            timestep = 1
            # Add <BEGIN> tag to mark start of sequence
            sequence_matrix[student_counter,
                            course_to_index['<BEGIN>']] = timestep
            quarter_grouped = courses_completed.groupby('quarter_id')
            for quarter, group in quarter_grouped:
                timestep += 1
                if 'min_quarter_id' in self.time_filters and quarter < self.time_filters['min_quarter_id']:
                    continue
                if 'max_quarter_id' in self.time_filters and quarter > self.time_filters['max_quarter_id']:
                    continue
                for index, row in group.iterrows():
                    if 'omit_summer' in self.time_filters and self.time_filters['omit_summer']:
                        if 'Summer' in row['quarter_name']:
                            timestep -= 1 # act as if quarter never happened
                            break
                    curr_course_index = course_to_index[row['course_id']]
                    sequence_matrix[student_counter,
                                    curr_course_index] = timestep
            # Add <END> tag to mark end of sequence
            sequence_matrix[student_counter,
                            course_to_index['<END>']] = timestep + 1

            # Updating the current student we are extracting info for
            student_counter += 1
            break

        return sequence_matrix, course_to_index

    def _read_pathways(self):
        """
        """
        return pd.read_csv(
            self.pathways_path, names=[
                "student_id",
                "course_id",
                "quarter_id",
                "quarter_name",
                "dropped",
                "curr_major",
                "final_major"
            ]
        )

    def _apply_attr_filters(self, df):
        """
        Applies filters based on student attributes.

        Currently, it filters solely on final major substrings (e.g. MBA, HSTRY, etc.)
        """
        mask = pd.Series([True] * len(df))
        for degree_substr in self.attr_filters['final_major']:
            mask = mask & ~df['final_major'].str.contains(f'{degree_substr}')
        return df[mask]