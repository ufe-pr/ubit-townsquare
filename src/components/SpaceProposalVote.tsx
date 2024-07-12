import { useCallback, useContext, useEffect, useState } from 'react';
import { Block } from './Block';
import { PrimaryButton } from './PrimaryButton';
import { Loader } from './Loader';
import { useUserInSpace } from '../hooks/space';
import { Proposal } from '@/types';
import { useAccount } from 'wagmi';
import { useClient } from '@/hooks/client';

export const SpaceProposalVote = ({
	proposal,
	onVoteSubmitted,
}: {
	proposal?: Proposal;
	className?: string;
	onVoteSubmitted: () => void;
}) => {
	const [selectedChoice, setSelectedChoice] = useState<bigint | null>(null);
	const [loading, setLoading] = useState(false);
	const client = useClient();
	const inSpace = useUserInSpace(proposal?.spaceId);
	const [_, rebuild] = useState({});
	const [votingPower, setVotingPower] = useState(0n);
	const {address} = useAccount();

	useEffect(() => {
		(async () => {
			Object.keys(_);
			if (!proposal) return 0n;
			console.log(proposal);

			const votingPower = await client?.getVotingPower(proposal.spaceId, proposal.snapshot);
			if (votingPower) {
				return votingPower;
			}
			return 0n;
		})().then(setVotingPower);
	}, [client, proposal, _]);

	const [hasVoted, setHasVoted] = useState<boolean | null>(null);

	useEffect(() => {
		(async () => {
			Object.keys(_);

			if (!proposal || !address) return null;
			console.log(proposal);

			const hasVoted = await client?.hasUserVoted(
				proposal.spaceId,
				proposal.id,
				address
			) ?? false;
			return hasVoted;
		})().then((e) => setHasVoted(e));
	}, [client, proposal, _, address]);

	useEffect(() => {
		setSelectedChoice(null);
	}, []);

	useEffect(() => {
		proposal && client?.getSpace(proposal?.spaceId).then(() => rebuild({}));
	}, [client, proposal]);

	const selectChoice = useCallback(
		(choiceIndex: bigint) => {
			if (!proposal || 0 >= votingPower || hasVoted) return;
			setSelectedChoice(choiceIndex);
		},
		[hasVoted, proposal, votingPower]
	);

	const submitVote = useCallback(async () => {
		if (!proposal || selectedChoice == null) {
			return;
		}
		setLoading(true);
		try {
			await client?.vote(proposal.spaceId, proposal.id, selectedChoice);
			setSelectedChoice(null);
			onVoteSubmitted();
		} catch (e) {
			console.error(e);
		}
		setLoading(false);
	}, [client, onVoteSubmitted, proposal, selectedChoice]);

	return (
		<Block
			loading={!proposal}
			title="Cast your vote"
			endTitle={hasVoted ? '✔️ Voted' : votingPower.toString()}
		>
			{proposal && (
				<>
					<div className="mb-4 md:mb-6 space-y-4 md:space-y-6">
						{proposal.choices.length &&
							proposal.choices.map((choice, i) => (
								<div key={i}>
									<div
										className={
											'flex w-full items-center justify-between overflow-hidden border h-12 border-skin-alt bg-transparent rounded-full duration-200 px-5 text-lg cursor-pointer' +
											((selectedChoice === BigInt(i) && ' !border-skin-text-muted') || '')
										}
										onClick={() => selectChoice(BigInt(i))}
									>
										<div className="truncate w-full text-center">{choice}</div>
									</div>
								</div>
							))}
					</div>
					<PrimaryButton
						disabled={
							loading || !inSpace || hasVoted || votingPower <= 0 || selectedChoice === null
						}
						className="mx-auto"
						onClick={submitVote}
					>
						{loading ? (
							<>
								<Loader className="h-6 w-6" /> Loading...
							</>
						) : (
							'Vote'
						)}
					</PrimaryButton>
					{!inSpace && (
						<div className="text-red-400">
							<p>
								You&apos;re not a member of this space. You need to be a member to vote on proposals.
							</p>
						</div>
					)}
				</>
			)}
		</Block>
	);
};
