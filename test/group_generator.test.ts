import { GroupGenerator, GroupGeneratorConfig } from '../src/group_generator';

describe('GroupGenerator', () => {
    let config: GroupGeneratorConfig;
    let generator: GroupGenerator;

    beforeEach(() => {
        config = {
            groupMemberSize: 2,
            members: ['A', 'B', 'C', 'D'],
            initialPairWeightFn: (member0, member1) => Math.abs(member0.charCodeAt(0) - member1.charCodeAt(0)),
            roundWeight: 1,
            maxGenerations: 10,
            mutationProbability: 0.1,
        };
        generator = new GroupGenerator(config);
    });

    test('should generate groups', () => {
        const grouping = generator.generateGroups();
        expect(grouping.groups.length).toBe(2);
        expect(grouping.totalWeight).toBeGreaterThan(0);
    });

    test('should throw error if number of members is not a multiple of group size', () => {
        config.members.push('E');
        expect(() => new GroupGenerator(config)).toThrowError('The number of members should be a multiple of the group member size.');
    });
});