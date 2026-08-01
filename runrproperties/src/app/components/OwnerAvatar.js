"use client";

function getAvatarColor(name) {
  const colors = ["#e74c3c","#e67e22","#f39c12","#27ae60","#16a085","#2980b9","#8e44ad","#d35400","#c0392b","#1abc9c","#2ecc71","#3498db","#9b59b6","#e91e63","#ff5722","#607d8b"];
  if (!name) return "#007bbd";
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function OwnerAvatar({ owner, size = 44 }) {
  const bg = owner?.profilePhoto ? "transparent" : (owner?.avatarColor || getAvatarColor(owner?.name));
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden", flexShrink: 0,
      boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
    }}>
      {owner?.profilePhoto ? (
        <img src={owner.profilePhoto} alt={owner?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <span style={{ fontSize: size * 0.38, fontWeight: 700, color: "white" }}>
          {owner?.name?.charAt(0)?.toUpperCase() || "O"}
        </span>
      )}
    </div>
  );
}
