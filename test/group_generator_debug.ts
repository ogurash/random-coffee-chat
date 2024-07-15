// Testing the group generator.

// Import the group generator.
import { GroupGenerator, printGrouping } from '../src/group_generator';

// Set up config.
const config = {
    groupMemberSize: 2,
    members: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    initialPairWeightFn: () => 1,
    roundWeight: 1,
    maxGenerations: 10,
    mutationProbability: 0.1,
};

// Create a group generator.
const generator = new GroupGenerator(config);

// Generate groups 5 times, and log the result.
const groupings = [];
for (let i = 0; i < 50; i++) {
    const grouping = generator.generateGroups();
    groupings.push(grouping);
    printGrouping(grouping);
}

// Print the number of matchings for each pair of members.
const matchings = {};
groupings.forEach(grouping => {
    grouping.groups.forEach(group => {
        group.memberIndices.forEach((memberIndex, i) => {
            group.memberIndices.slice(i + 1).forEach(otherMemberIndex => {
                const member = grouping.members[memberIndex];
                const otherMember = grouping.members[otherMemberIndex];
                const key = [member, otherMember].sort().join(',');
                matchings[key] = (matchings[key] || 0) + 1;
            });
        });
    });
});
console.log('Matchings:');
Object.entries(matchings).forEach(([key, count]) => {
    console.log(key + ': ' + count);
});
