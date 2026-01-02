// import { useState, useEffect } from 'react';
// import { Client, CreateClientPayload, VersionOption } from '@/services/clientService';
// import Modal from '@/components/shared/Modal';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
// import { fetchVersions } from '@/store/clientsSlice';

// interface ClientFormModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (data: CreateClientPayload) => void;
//   client?: Client | null;
// }

// const ClientFormModal = ({ isOpen, onClose, onSubmit, client }: ClientFormModalProps) => {
//   const dispatch = useAppDispatch();
//   const { versions } = useAppSelector((state) => state.clients);
  
//   const [formData, setFormData] = useState<CreateClientPayload>({
//     AKA: '',
//     AgencyFDID: '',
//     AgencyNameLong: '',
//     AgencyNameShort: '',
//     AgencyState: '',
//     AgencyTimeZone: '',
//     CADLinkField: '',
//     DataSource: '',
//     IncTypeStandard: 1,
//     PlugUglyFDID: '',
//     RMSLinkField: '',
//     RecordCustomerID: '',
//     RecordUseType: 1,
//     RespectDST: 1,
//     SourceProviderID: '',
//     UpsertMatchingField: '',
//     version_id: 0,
//   });
//   const [errors, setErrors] = useState<Partial<Record<keyof CreateClientPayload, string>>>({});

//   // Fetch versions when modal opens
//   useEffect(() => {
//     if (isOpen && versions.length === 0) {
//       dispatch(fetchVersions());
//     }
//   }, [isOpen, versions.length, dispatch]);

//   // Reset form when modal opens/closes or client changes
//   useEffect(() => {
//     if (isOpen) {
//       setFormData({
//         AKA: '', // Not available in listing API
//         AgencyFDID: client?.fdid || '',
//         AgencyNameLong: client?.agencynamelong || '',
//         AgencyNameShort: client?.agencynameshort || '',
//         AgencyState: client?.agencystate || '',
//         AgencyTimeZone: '', // Not available in listing API
//         CADLinkField: '', // Not available in listing API
//         DataSource: client?.sourcetype || '',
//         IncTypeStandard: client?.inctypestandard || 1,
//         PlugUglyFDID: client?.pluguglyfdid || '',
//         RMSLinkField: '', // Not available in listing API
//         RecordCustomerID: '', // Not available in listing API
//         RecordUseType: 1, // Default value since not in listing API
//         RespectDST: 1, // Default value since not in listing API
//         SourceProviderID: '', // Not available in listing API
//         UpsertMatchingField: '', // Not available in listing API
//         version_id: client?.version_id || 0,
//       });
//       setErrors({});
//     }
//   }, [isOpen, client]);

//   const validate = (): boolean => {
//     const newErrors: Partial<Record<keyof CreateClientPayload, string>> = {};

//     if (!formData.AgencyNameLong.trim()) {
//       newErrors.AgencyNameLong = 'Agency name is required';
//     }

//     if (!formData.PlugUglyFDID.trim()) {
//       newErrors.PlugUglyFDID = 'PlugUgly FDID is required';
//     }

//     if (!formData.AgencyFDID.trim()) {
//       newErrors.AgencyFDID = 'Agency FDID is required';
//     }

//     if (formData.version_id === 0) {
//       newErrors.version_id = 'Version is required';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (validate()) {
//       onSubmit(formData);
//     }
//   };

//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={onClose}
//       title={client ? 'Edit Client' : 'Create Client'}
//       description={client ? 'Update client details' : 'Add a new client to your catalog'}
//       footer={
//         <div className="flex gap-2">
//           <Button variant="outline" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button onClick={handleSubmit}>
//             {client ? 'Update' : 'Create'}
//           </Button>
//         </div>
//       }
//     >
//       <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
//         <div className="grid grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <Label htmlFor="agencynamelong">Agency Name Long *</Label>
//             <Input
//               id="agencynamelong"
//               value={formData.AgencyNameLong}
//               onChange={(e) => setFormData({ ...formData, AgencyNameLong: e.target.value })}
//               placeholder="Fire Department of Example City"
//               className={errors.AgencyNameLong ? 'border-destructive' : ''}
//             />
//             {errors.AgencyNameLong && (
//               <p className="text-sm text-destructive">{errors.AgencyNameLong    }</p>
//             )}
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="AgencyNameShort">Agency Name Short</Label>
//             <Input
//               id="AgencyNameShort"
//               value={formData.AgencyNameShort}
//               onChange={(e) => setFormData({ ...formData, AgencyNameShort: e.target.value })}
//               placeholder="FDEC"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="AKA">AKA</Label>
//             <Input
//               id="AKA"
//               value={formData.AKA}
//               onChange={(e) => setFormData({ ...formData, AKA: e.target.value })}
//               placeholder="Example Fire"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="AgencyFDID">Agency FDID *</Label>
//             <Input
//               id="AgencyFDID"
//               value={formData.AgencyFDID}
//               onChange={(e) => setFormData({ ...formData, AgencyFDID: e.target.value })}
//               placeholder="04601"
//               className={errors.AgencyFDID ? 'border-destructive' : ''}
//             />
//             {errors.AgencyFDID && (
//               <p className="text-sm text-destructive">{errors.AgencyFDID}</p>
//             )}
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="PlugUglyFDID">PlugUgly FDID *</Label>
//             <Input
//               id="PlugUglyFDID"
//               value={formData.PlugUglyFDID}
//               onChange={(e) => setFormData({ ...formData, PlugUglyFDID: e.target.value })}
//               placeholder="MI-04601"
//               className={errors.PlugUglyFDID ? 'border-destructive' : ''}
//             />
//             {errors.PlugUglyFDID && (
//               <p className="text-sm text-destructive">{errors.PlugUglyFDID}</p>
//             )}
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="AgencyState">Agency State</Label>
//             <Input
//               id="AgencyState"
//               value={formData.AgencyState}
//               onChange={(e) => setFormData({ ...formData, AgencyState: e.target.value })}
//               placeholder="MI"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="AgencyTimeZone">Agency Time Zone</Label>
//             <Input
//               id="AgencyTimeZone"
//               value={formData.AgencyTimeZone}
//               onChange={(e) => setFormData({ ...formData, AgencyTimeZone: e.target.value })}
//               placeholder="America/New_York"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="DataSource">Data Source</Label>
//             <Input
//               id="DataSource"
//               value={formData.DataSource}
//               onChange={(e) => setFormData({ ...formData, DataSource: e.target.value })}
//               placeholder="firstdue"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="CADLinkField">CAD Link Field</Label>
//             <Input
//               id="CADLinkField"
//               value={formData.CADLinkField}
//               onChange={(e) => setFormData({ ...formData, CADLinkField: e.target.value })}
//               placeholder="CAD123"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="RMSLinkField">RMS Link Field</Label>
//             <Input
//               id="RMSLinkField"
//               value={formData.RMSLinkField}
//               onChange={(e) => setFormData({ ...formData, RMSLinkField: e.target.value })}
//               placeholder="RMS456"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="RecordCustomerID">Record Customer ID</Label>
//             <Input
//               id="RecordCustomerID"
//               value={formData.RecordCustomerID}
//               onChange={(e) => setFormData({ ...formData, RecordCustomerID: e.target.value })}
//               placeholder="CUST001"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="SourceProviderID">Source Provider ID</Label>
//             <Input
//               id="SourceProviderID"
//               value={formData.SourceProviderID}
//               onChange={(e) => setFormData({ ...formData, SourceProviderID: e.target.value })}
//               placeholder="PROV001"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="UpsertMatchingField">Upsert Matching Field</Label>
//             <Input
//               id="UpsertMatchingField"
//               value={formData.UpsertMatchingField}
//               onChange={(e) => setFormData({ ...formData, UpsertMatchingField: e.target.value })}
//               placeholder="IncidentNumber"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="version_id">Version *</Label>
//             <Select
//               value={formData.version_id.toString()}
//               onValueChange={(value) => setFormData({ ...formData, version_id: parseInt(value) })}
//             >
//               <SelectTrigger className={errors.version_id ? 'border-destructive' : ''}>
//                 <SelectValue placeholder="Select a version" />
//               </SelectTrigger>
//               <SelectContent>
//                 {versions.map((version) => (
//                   <SelectItem key={version.id} value={version.id.toString()}>
//                     {version.version_name} ({version.version_code})
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             {errors.version_id && (
//               <p className="text-sm text-destructive">{errors.version_id}</p>
//             )}
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="IncTypeStandard">Inc Type Standard</Label>
//             <Input
//               id="IncTypeStandard"
//               type="number"
//               value={formData.IncTypeStandard}
//               onChange={(e) => setFormData({ ...formData, IncTypeStandard: parseInt(e.target.value) || 1 })}
//               placeholder="1"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="RecordUseType">Record Use Type</Label>
//             <Input
//               id="RecordUseType"
//               type="number"
//               value={formData.RecordUseType}
//               onChange={(e) => setFormData({ ...formData, RecordUseType: parseInt(e.target.value) || 1 })}
//               placeholder="1"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="RespectDST">Respect DST</Label>
//             <Input
//               id="RespectDST"
//               type="number"
//               value={formData.RespectDST}
//               onChange={(e) => setFormData({ ...formData, RespectDST: parseInt(e.target.value) || 1 })}
//               placeholder="1"
//             />
//           </div>
//         </div>
//       </form>
//     </Modal>
//   );
// };

// export default ClientFormModal;