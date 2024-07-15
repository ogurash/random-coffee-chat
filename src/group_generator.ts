const NUM_RANDOM_SWAP = 3;
const NUM_RANDOM_GROUPING = 2;
const NUM_GROUPINGS = 10;

export type GroupGeneratorConfig = {
    // Number of members in each group.
    groupMemberSize: number;
    // Members to be grouped.
    members: string[];
    // Weights of each member. The lower the weight, the more likely the member will be grouped with others.
    initialPairWeightFn: (member0: string, member1: string) => number;
    // Weight added to each member after each grouping.
    roundWeight: number;
    // The number of generations to run the algorithm.
    maxGenerations: number;
    // The probability of mutation.
    mutationProbability: number;
};

export type AssignedGroup = {
    // The members assigned to this group.
    memberIndices: number[];

    // The total weight of this group.
    weight: number;
};

export type Grouping = {
    // Members.
    members: string[];

    // The groups of members.
    groups: AssignedGroup[];

    // The total weight of the grouping.
    totalWeight: number;
};

export function printGrouping(grouping: Grouping): void {
    console.log('Total weight: ' + grouping.totalWeight);
    grouping.groups.forEach((group, i) => {
        console.log('Group ' + i + ': ' + group.memberIndices.map(index => grouping.members[index]).join(', '));
    });
}

/**
 * Generates groups of members based on the given configuration.
 * This uses genetic algorithm to group members, to minimize the weight of each pair of members.
 */
export class GroupGenerator {
    private readonly initialPairWeights: number[][];
    private pairWeights: number[][];
    constructor(private readonly config: GroupGeneratorConfig) {
        // Validate the configuration.
        if (config.members.length % config.groupMemberSize !== 0) {
            throw new Error('The number of members should be a multiple of the group member size.');
        }

        // Initialize pair weights.
        this.initialPairWeights = [];
        for (let i = 0; i < this.config.members.length; i++) {
            this.initialPairWeights[i] = [];
            for (let j = i + 1; j < this.config.members.length; j++) {
                this.initialPairWeights[i][j] = this.config.initialPairWeightFn(this.config.members[i], this.config.members[j]);
            }
        }
        // Copy the initial pair weights to pair weights.
        this.pairWeights = this.initialPairWeights.map(row => row.slice());
    }

    generateGroups(): Grouping {
        // Calculate the weight of each pair of members.

        // Initialize population
        let groupings = this.initializeGroupings();

        // TODO(ogurash): This doesn't have crossover, so maybe no need to keep multiple groupings.

        for (let i = 0; i < this.config.maxGenerations; i++) {
            // Crossover of parents is not simple, because member assignment should not have overlapping members.
            // Instead, we will use a simple genetic algorithm to generate new groupings.

            const newGroupings: Grouping[] = [];

            // Select the least weighted grouping as a parent.
            const parent = groupings[0];

            // Add the parent to the new groupings.
            newGroupings.push(parent);

            // Randomly keep some groupings.
            for (let i = 0; i < NUM_RANDOM_GROUPING; i++) {
                newGroupings.push(groupings[Math.floor(Math.random() * groupings.length)]);
            }

            // Mutation 1: Randomly swap members in a group.
            for (let i = 0; i < NUM_RANDOM_SWAP; i++) {
                newGroupings.push(this.randomSwap(parent));
            }

            // Mutation 2: Swapping members from the heighest weighted groups to lower weighted groups.
            newGroupings.push(...this.weightSwap(parent));

            // Sort the new groupings by total weight, and keep the best groupings.
            groupings = newGroupings.sort((a, b) => a.totalWeight - b.totalWeight).slice(0, NUM_GROUPINGS);
        }

        // Return the best solution, after updating the pair weights.
        const bestGrouping = groupings[0];
        bestGrouping.groups.forEach(group => {
            for (let i = 0; i < group.memberIndices.length; i++) {
                for (let j = i + 1; j < group.memberIndices.length; j++) {
                    this.pairWeights[group.memberIndices[i]][group.memberIndices[j]] += this.config.roundWeight;
                }
            }
        });

        return bestGrouping;
    }

    private createGrouping(groupMemberIndices: number[][]): Grouping {
        const groups: AssignedGroup[] = [];
        for (let i = 0; i < groupMemberIndices.length; i++) {
            const memberIndices = groupMemberIndices[i].slice();
            memberIndices.sort((a: number, b: number) => a - b);
            let weight = 0;
            for (let j = 0; j < memberIndices.length; j++) {
                for (let k = j + 1; k < memberIndices.length; k++) {
                    weight += this.pairWeights[memberIndices[j]][memberIndices[k]];
                }
            }
            groups.push({ memberIndices, weight });
        }

        // Sort the groups by weight.
        groups.sort((a, b) => a.weight - b.weight);

        const totalWeight = groups.reduce((acc, group) => acc + group.weight, 0);
        const members = this.config.members;

        return { members, groups, totalWeight };
    }

    /** Randomly assign the inital groups. */
    private initializeGroupings(): Grouping[] {
        const groupings: Grouping[] = [];
        for (let i = 0; i < NUM_GROUPINGS; i++) {
            let initialArray = Array.from(Array(this.config.members.length).keys());

            // Shuffle the array to create a random initial population.
            initialArray = this.shuffleArray(initialArray);

            // Split the array into groups of groupMemberSize.
            const population: number[][] = [];
            for (let i = 0; i < initialArray.length; i += this.config.groupMemberSize) {
                population.push(initialArray.slice(i, i + this.config.groupMemberSize));
            }

            groupings.push(this.createGrouping(population));
        }
        // Sort the groupings by total weight.
        return groupings.sort((a, b) => a.totalWeight - b.totalWeight);
    }

    private shuffleArray(array: number[]): number[] {
        return array.sort(() => Math.random() - 0.5);
    }

    /** Randomly swap members with other groups, with the configured probability. */
    private randomSwap(parent: Grouping): Grouping {
        let memberIndices = parent.groups.map(group => group.memberIndices.slice());
        for (let i = 0; i < memberIndices.length; i++) {
            if (Math.random() < this.config.mutationProbability) {
                const j = Math.floor(Math.random() * memberIndices.length);
                const k = Math.floor(Math.random() * memberIndices[i].length);
                const l = Math.floor(Math.random() * memberIndices[j].length);
                const temp = memberIndices[i][k];
                memberIndices[i][k] = memberIndices[j][l];
                memberIndices[j][l] = temp;
            }
        }
        return this.createGrouping(memberIndices);
    }

    /** Swap members from the highest weigted group to lower weigted groups. */
    private weightSwap(parent: Grouping): Grouping[] {
        const output: Grouping[] = [];

        // The last group has the highest weight.
        const highestWeightGroup = parent.groups[parent.groups.length - 1];

        // Try swapping members from the highest weight group to lower weight groups.
        for (let groupIndex = 0; groupIndex < parent.groups.length - 1; groupIndex++) {
            for (let highestWeightGroupMemberIndex = 0; highestWeightGroupMemberIndex < highestWeightGroup.memberIndices.length; highestWeightGroupMemberIndex++) {
                for (let groupMemberIndex = 0; groupMemberIndex < parent.groups[groupIndex].memberIndices.length; groupMemberIndex++) {
                    // Swap the members.
                    let memberIndices = parent.groups.map(group => group.memberIndices.slice());
                    const temp = memberIndices[groupIndex][groupMemberIndex];
                    memberIndices[groupIndex][groupMemberIndex] = highestWeightGroup.memberIndices[highestWeightGroupMemberIndex];
                    memberIndices[parent.groups.length - 1][highestWeightGroupMemberIndex] = temp;

                    output.push(this.createGrouping(memberIndices));
                }
            }
        }

        return output;
    }
}