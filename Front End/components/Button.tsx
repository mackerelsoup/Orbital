import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
    label: string;
    onPress?: () => void;
    children?: React.ReactElement
};

export default function Button({ label, onPress, children }: Props) {

    return (
        <View style={[
            styles.buttonContainer
        ]}>
            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    { opacity: pressed ? 0.5 : 1 },
                ]}
                onTouchEnd={onPress}
                >
                <View style = {{flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={styles.buttonLabel}>{label}</Text>
                    {children}
                </View>

            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        margin: 8,

    },
    button: {
        width: "100%",
        alignItems: 'center',
        justifyContent: 'center',
        //borderRadius: 50,
        backgroundColor: "black"

    },
    buttonLabel: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center'
    },
});
