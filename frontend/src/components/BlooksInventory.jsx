import React, { useState, useEffect } from 'react';

export default function BlooksInventory({ userId }) {
  const [blooks, setBlooks] = useState([]);
  const [equippedId, setEquippedId] = useState(null);

  useEffect(() => {
    const fetchBlooks = async () => {
      try {
        const response = await fetch(`/api/blooks/inventory/${userId}`);
        const data = await response.json();
        if (data.success) {
          setBlooks(data.blooks);
          const equipped = data.blooks.find(b => b.equipped);
          if (equipped) setEquippedId(equipped.id);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchBlooks();
  }, [userId]);

  const handleEquip = async (blookId) => {
    const response = await fetch('/api/blooks/equip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, blookId }),
    });
    const data = await response.json();
    if (data.success) {
      setEquippedId(blookId);
      alert('Equipped!');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>My Blooks</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {blooks.map(blook => (
          <div key={blook.id} style={{ border: '2px solid #ccc', padding: '15px', borderRadius: '10px' }}>
            <h3>{blook.blook_name}</h3>
            <p>{blook.rarity}</p>
            {equippedId === blook.id ? (
              <span style={{ color: 'green', fontWeight: 'bold' }}>✓ Equipped</span>
            ) : (
              <button onClick={() => handleEquip(blook.id)} style={{ padding: '10px 15px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Equip
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
