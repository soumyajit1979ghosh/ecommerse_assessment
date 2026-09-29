import { useEffect, useState } from "react";

function Countdown({
	expiresAt,
	onExpire,
}: {
	expiresAt: string;
	onExpire: () => void;
}) {
	const [remaining, setRemaining] = useState(() =>
		Math.max(0, new Date(expiresAt).getTime() - Date.now()),
	);

	useEffect(() => {
		const timer = window.setInterval(() => {
			const value = Math.max(
				0,
				new Date(expiresAt).getTime() - Date.now(),
			);
			setRemaining(value);
			if (value === 0) onExpire();
		}, 250);
		return () => window.clearInterval(timer);
	}, [expiresAt, onExpire]);

	const seconds = Math.ceil(remaining / 1000);
	const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
	const ss = String(seconds % 60).padStart(2, "0");

	return (
		<strong>
			{mm}:{ss}
		</strong>
	);
}

export default Countdown;
