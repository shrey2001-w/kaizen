// components/AddOnsOverlay.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export interface AddOn {
  _id: string;
  name: string;
  price?: number;
  options?: { [key: string]: number }; // e.g. { small: 65, large: 130 }
  note?: string;
  selectedOption?: string;
  quantity?: number;
  customNote?: string;
}

interface AddOnsOverlayProps {
  onClose: () => void;
  onSubmit: (selectedAddOns: AddOn[]) => void;
}

const AddOnsOverlay: React.FC<AddOnsOverlayProps> = ({ onClose, onSubmit }) => {
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  // Map add-on id to quantity
  const [selected, setSelected] = useState<{ [id: string]: number }>({});
  // Map add-on id to the chosen option (for add-ons with options)
  const [selectedOptions, setSelectedOptions] = useState<{ [id: string]: string }>({});
  // For custom decor, track the custom note entered by the user
  const [customNotes, setCustomNotes] = useState<{ [id: string]: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAddOns() {
      try {
        setLoading(true);
        const res = await axios.get('/api/addOns'); // your API endpoint for add-ons
        setAddOns(res.data);
      } catch (err) {
        console.error('Error fetching add-ons:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAddOns();
  }, []);

  const handleCheckboxChange = (
    id: string,
    hasOptions: boolean,
    optionKeys?: string[]
  ) => {
    setSelected((prev) => {
      const newSelection = { ...prev };
      if (newSelection[id]) {
        // Unselect: remove quantity and any selected option/note
        delete newSelection[id];
        setSelectedOptions((prevOptions) => {
          const newOptions = { ...prevOptions };
          delete newOptions[id];
          return newOptions;
        });
        setCustomNotes((prevNotes) => {
          const newNotes = { ...prevNotes };
          delete newNotes[id];
          return newNotes;
        });
      } else {
        // Select: default quantity is 1
        newSelection[id] = 1;
        if (hasOptions && optionKeys && optionKeys.length > 0) {
          setSelectedOptions((prevOptions) => ({ ...prevOptions, [id]: optionKeys[0] }));
        }
      }
      return newSelection;
    });
  };

  const handleOptionChange = (addonId: string, option: string) => {
    setSelectedOptions((prev) => ({ ...prev, [addonId]: option }));
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setSelected((prev) => ({ ...prev, [id]: quantity }));
  };

  const handleCustomNoteChange = (id: string, note: string) => {
    setCustomNotes((prev) => ({ ...prev, [id]: note }));
  };

  const handleSubmit = () => {
    const selectedAddOns = addOns
      .filter((addOn) => selected[addOn._id])
      .map((addOn) => {
        // If the add-on has options, override price with the selected option's price
        if (addOn.options) {
          const selectedOption = selectedOptions[addOn._id];
          return {
            ...addOn,
            selectedOption,
            price: addOn.options[selectedOption],
            quantity: selected[addOn._id],
          };
        }
        // For Custom Decor, attach the custom note if provided
        if (addOn.name === 'Custom Decor') {
          return {
            ...addOn,
            quantity: selected[addOn._id],
            customNote: customNotes[addOn._id] || '',
          };
        }
        return { ...addOn, quantity: selected[addOn._id] };
      });
    onSubmit(selectedAddOns);
  };

  const handleSkip = () => {
    onSubmit([]);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto relative p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-600 hover:text-black"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Select Add-Ons
        </h2>
        {loading ? (
          <p className="text-gray-600">Loading add-ons...</p>
        ) : (
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {addOns.map((addon) => {
              const hasOptions = addon.options ? Object.keys(addon.options).length > 0 : false;
              const optionKeys = hasOptions ? Object.keys(addon.options!) : [];
              // Compute unit price based on selected option (if applicable) or direct price
              const unitPrice = hasOptions
                ? addon.options![selectedOptions[addon._id]]
                : addon.price;
              const quantity = selected[addon._id] || 0;
              const totalPrice =
                unitPrice && quantity ? (unitPrice * quantity).toFixed(2) : null;

              return (
                <div
                  key={addon._id}
                  className="p-3 border rounded hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id={addon._id}
                        checked={!!selected[addon._id]}
                        onChange={() =>
                          handleCheckboxChange(addon._id, hasOptions, optionKeys)
                        }
                        className="h-5 w-5 accent-[var(--blue)]"
                      />
                      <label htmlFor={addon._id} className="text-gray-700 font-medium">
                        {addon.name}
                      </label>
                    </div>
                    {selected[addon._id] && totalPrice && (
                      <span className="text-sm font-bold text-[var(--blue)]">
                        Total: ${totalPrice}
                      </span>
                    )}
                  </div>

                  {selected[addon._id] && (
                    <div className="my-5 flex items-center justify-between">
                      <div className="flex items-center space-x-2 border rounded">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              addon._id,
                              (selected[addon._id] || 1) - 1
                            )
                          }
                          className="px-2 py-1 border rounded bg-gray-200 hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="w-6 text-center">{selected[addon._id]}</span>
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              addon._id,
                              (selected[addon._id] || 1) + 1
                            )
                          }
                          className="px-2 py-1 border rounded bg-gray-200 hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {hasOptions && selected[addon._id] && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600">Choose an option:</p>
                      {optionKeys.map((key) => (
                        <label key={key} className="flex items-center">
                          <input
                            type="radio"
                            name={addon._id}
                            value={key}
                            checked={selectedOptions[addon._id] === key}
                            onChange={() => handleOptionChange(addon._id, key)}
                            className="mr-2 h-4 w-4 accent-[var(--blue)]"
                          />
                          {key.charAt(0).toUpperCase() + key.slice(1)} ($
                          {addon.options![key]})
                        </label>
                      ))}
                    </div>
                  )}

                  {addon.name === 'Custom Decor' && selected[addon._id] && (
                    <div className="mt-2 flex flex-col space-y-2">
                      <input
                        type="text"
                        placeholder="Enter your custom request..."
                        value={customNotes[addon._id] || ''}
                        onChange={(e) => handleCustomNoteChange(addon._id, e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                      <a
                        href="tel:+14702318628"
                        className="text-[var(--blue)] underline text-sm w-max self-end"
                      >
                        Call Us
                      </a>
                    </div>
                  )}

                  {addon.note && (
                    <div className="mt-1 text-xs text-gray-500">{addon.note}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-6 flex justify-between">
          <button
            onClick={handleSkip}
            className="px-4 py-2 rounded bg-[var(--blue)] text-white hover:bg-[var(--blue)] transition"
          >
            Skip
          </button>
          <div className="space-x-4">
            
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded bg-black text-white hover:bg-blue-700 transition"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOnsOverlay;
