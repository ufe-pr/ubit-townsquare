import { useState, useCallback, useContext } from 'react';
import { UserSpacesContext } from '../providers/UserSpacesContext';
import { Space } from '@/types';
import { useJoinSpace, useUserInSpace } from '@/hooks/space';

const JoinButton = ({ space }: { space: Space }) => {
	const [loading, setLoading] = useState(false);
	const joinSpace = useJoinSpace();
	const { userSpaces, setUserSpaces } = useContext(UserSpacesContext);
	const joined = useUserInSpace(space.id);
	const handleClick = useCallback(async () => {
		setLoading(true);
		try {
			await joinSpace(space.id);
			setUserSpaces([...userSpaces, space]);
		} catch {
			// TODO: Show error modal when function fails or do error handling outside
		}
		setLoading(false);
	}, [joinSpace, space, setUserSpaces, userSpaces]);
	return (
		<button
			onClick={
				joined || loading
					? undefined
					: (e) => {
							e.preventDefault();
							handleClick();
					  }
			}
			className={
				'px-8 py-2 rounded-full border-2 border-gray-400 duration-200' +
				(joined ? ' border-opacity-50 cursor-default' : ' hover:bg-white/70 hover:text-black/80')
			}
		>
			{loading ? '...' : joined ? 'Joined' : 'Join'}
		</button>
	);
};

export default JoinButton;
